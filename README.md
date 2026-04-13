# Waygood: AI Task Processing Platform

A MERN stack application with a Python worker, Redis queue, and Kubernetes deployment. Designed to process complex AI operations asynchronously at scale.

## Features
-  User Authentication (JWT + Bcrypt)
-  Asynchronous AI Task Processing
-  Task Status Tracking (Pending -> Running -> Success/Failed)
-  Modern Premium UI (React + Framer Motion)
-  Scalable Architecture (Kubernetes + Docker)

## Services
- Frontend: React (Vite)
- Backend API: Node.js/Express
- Worker: Python (Redis Consumer)
- Database: MongoDB
- Queue: Redis

## Local Development (Docker Compose)
1. Clone the repository.
2. Ensure you have Docker and Docker Compose installed.
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:80`.
5. Access the API at `http://localhost:5000`.

## Kubernetes Deployment
1. Install a K8s cluster (k3s/minikube).
2. Install Argo CD.
3. Apply the namespace:
   ```bash
   kubectl apply -f infra/namespace.yaml
   ```
4. Apply the manifestations:
   ```bash
   kubectl apply -f infra/
   ```

## GitOps with Argo CD
Manifests are stored in the `/infra` directory. For a real GitOps setup:
1. Create a separate repository for infrastructure.
2. Point Argo CD to that repository.
3. Enable Auto-Sync.

## Security
- Password hashing with Bcrypt.
- JWT-based authentication with expiration.
- Helmet.js for secure headers.
- Rate limiting for API protection.
- Non-root user in all Docker containers.
