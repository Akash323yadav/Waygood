import os
import json
import time
import redis
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Config
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/ai_tasks')

# Connections
r = redis.from_url(REDIS_URL)
client = MongoClient(MONGODB_URI)
db = client.get_database()
tasks_collection = db.tasks

def process_task(operation, input_data):
    """Supported operations: uppercase, lowercase, reverse string, word count."""
    if operation == 'uppercase':
        return input_data.upper()
    elif operation == 'lowercase':
        return input_data.lower()
    elif operation == 'reverse':
        return input_data[::-1]
    elif operation == 'word_count':
        return str(len(input_data.split()))
    else:
        raise ValueError(f"Unknown operation: {operation}")

def worker():
    print("Worker started. Waiting for tasks...")
    while True:
        try:
            # BRPOP returns (key, value)
            job = r.brpop('task_queue', timeout=5)
            if job:
                _, task_json = job
                task_data = json.loads(task_json)
                task_id = task_data['taskId']
                operation = task_data['operation']
                input_data = task_data['inputData']

                print(f"Processing task {task_id}: {operation}")

                # Update status to 'running'
                tasks_collection.update_one(
                    {"_id": ObjectId(task_id)},
                    {"$set": {"status": "running"}, "$push": {"logs": {"message": "Worker started processing", "timestamp": time.time()}}}
                )

                try:
                    result = process_task(operation, input_data)
                    
                    # Success
                    tasks_collection.update_one(
                        {"_id": ObjectId(task_id)},
                        {
                            "$set": {"status": "success", "result": result},
                            "$push": {"logs": {"message": f"Task completed successfully. Result: {result}", "timestamp": time.time()}}
                        }
                    )
                    print(f"Task {task_id} success")
                except Exception as e:
                    # Failed
                    tasks_collection.update_one(
                        {"_id": ObjectId(task_id)},
                        {
                            "$set": {"status": "failed"},
                            "$push": {"logs": {"message": f"Error: {str(e)}", "timestamp": time.time()}}
                        }
                    )
                    print(f"Task {task_id} failed: {str(e)}")

        except Exception as e:
            print(f"Worker Loop Error: {str(e)}")
            time.sleep(5)

if __name__ == "__main__":
    worker()
