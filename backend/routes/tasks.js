const express = require("express");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ======================================================
// CREATE TASK
// POST /api/tasks
// ======================================================

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const newTask = {
            title: title,
            description: description || "",
            status: status || "pending",
            userId: req.user.userId,
            createdAt: new Date()
        };

        const result = await tasks.insertOne(newTask);

        res.status(201).json({
            message: "Task created successfully",
            taskId: result.insertedId
        });

    } catch (error) {
        console.error("CREATE TASK ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================================================
// GET ALL TASKS FOR LOGGED-IN USER
// GET /api/tasks
// ======================================================

router.get("/", authenticateToken, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const allTasks = await tasks
            .find({
                userId: req.user.userId
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(allTasks);

    } catch (error) {
        console.error("GET TASKS ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================================================
// GET TASKS FOR ONE USER
// GET /api/tasks/user/:userId
// ======================================================

router.get("/user/:userId", authenticateToken, async (req, res) => {
    try {
        if (req.params.userId !== req.user.userId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const userTasks = await tasks
            .find({
                userId: req.user.userId
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(userTasks);

    } catch (error) {
        console.error("GET USER TASKS ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================================================
// UPDATE TASK
// PUT /api/tasks/:id
// ======================================================

router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const taskId = req.params.id;

        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const result = await tasks.updateOne(
            {
                _id: new ObjectId(taskId),
                userId: req.user.userId
            },
            {
                $set: {
                    title: title,
                    description: description || "",
                    status: status || "pending",
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully"
        });

    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// ======================================================
// DELETE TASK
// DELETE /api/tasks/:id
// ======================================================

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;

        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const result = await tasks.deleteOne({
            _id: new ObjectId(taskId),
            userId: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("DELETE TASK ERROR:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;