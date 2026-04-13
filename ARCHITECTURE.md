# Architecture Document: AI Task Processing Platform

## 1. System Overview
The AI Task Processing Platform is a scalable, distributed system designed to process text-based AI operations asynchronously. The architecture follows a microservices pattern, utilizing a React frontend, Node.js API, Redis-based task queue, and multiple Python workers for processing.

### Tech Stack
- **Frontend**: React (Vite) + Framer Motion (UI/UX)
- **Backend API**: Node.js + Express + JWT + Mongoose
- **Task Queue**: Redis (List-based queue)
- **Worker**: Python (Processing logic)
- **Database**: MongoDB
- **Infrastructure**: Kubernetes (k3s), Docker, Argo CD

## 2. Worker Scaling Strategy
The system uses **Horizontal Pod Autoscaling (HPA)** for the Python workers. 
- **Metric-based Scaling**: Workers scale based on the length of the Redis `task_queue` or CPU utilization.
- **Independence**: Each worker is stateless and draws jobs from Redis using the `BRPOP` command, ensuring that only one worker processes a specific task at a time.
- **K8s Implementation**: The `worker.yaml` deployment manifest specifies multiple replicas (default set to 3), which can be dynamically adjusted by an HPA resource based on queue performance.

## 3. Handling High Task Volume (100k+ tasks/day)
To handle 100k+ tasks per day (~1.15 tasks per second on average with bursts), the system implements several strategies:
- **Asynchronous Decoupling**: The API does not wait for task completion. It only persists the task to MongoDB and pushes the `taskId` to Redis, returning immediately (latency < 100ms).
- **Load Balancing**: The Ingress controller and Kubernetes Services distribute traffic across multiple Backend and Frontend pods.
- **Connection Pooling**: Backend uses connection pooling for both MongoDB and Redis to handle concurrent requests efficiently.
- **Batching (Optional Optimization)**: If volume increases further, workers can be modified to fetch tasks in batches or use Redis Streams for better consumer group management.

## 4. Database Indexing Strategy
To ensure fast lookups, especially as the task volume grows, the following indexes are implemented in MongoDB:
- `userId`: **Single Field Index** on `tasks` collection to speed up the "My Tasks" dashboard.
- `status`: **Compound Index** with `userId` to filter tasks by their current state effectively.
- `createdAt`: **Descending Index** for sorted list views.
- `email`: **Unique Index** on `users` collection for authentication.

## 5. Handling Redis Failure
Redis is critical for task distribution. The system handles failures as follows:
- **Resilience in Backend**: If Redis is down, the Backend returns a `503 Service Unavailable` or saves the task to MongoDB with a `pending` status but logs the queue failure. A separate "re-queue" cron job can later push `pending` tasks that aren't in the queue once Redis is back.
- **Persistence**: Using AOF (Append Only File) in Redis ensures that even if the Redis pod restarts, the tasks in the queue are not lost.
- **Sentinel/Cluster**: In a production environment, we would use Redis Sentinel or a Managed Redis Cluster (like Elasticache) for high availability.

## 6. Staging and Production Deployment
The deployment follows a **GitOps workflow** using **Argo CD**:
- **Staging**: Triggered on pushes to the `develop` branch. Manifests in the `infra/staging` folder are synced to the `staging` namespace.
- **Production**: Triggered on tags or pushes to the `main` branch. The CI pipeline updates the image tags in the `infra/production` manifests. Argo CD detects the change in the infrastructure repository and automatically rolls out the new version to the `production` namespace using a **Rolling Update** strategy to ensure zero downtime.

## 7. Security Measures
- **Rate Limiting**: `express-rate-limit` prevents brute force and DDoS on API endpoints.
- **Helmet**: Secures Express apps by setting various HTTP headers.
- **Non-Root Containers**: All Docker images run as a non-privileged user to minimize the attack surface.
- **Secret Management**: Kubernetes Secrets are used for sensitive data (JWT keys, DB strings) instead of environment variables in code.
