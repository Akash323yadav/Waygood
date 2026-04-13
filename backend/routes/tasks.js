const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const redis = require('../config/redis');

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, inputData, operation } = req.body;
        const task = new Task({
            title,
            inputData,
            operation,
            userId: req.user.id
        });
        await task.save();

        // Push to Redis Queue
        const jobData = JSON.stringify({
            taskId: task._id,
            operation,
            inputData
        });
        await redis.lpush('task_queue', jobData);

        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
