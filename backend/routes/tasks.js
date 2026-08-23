const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();


// ======================================================
// CREATE TASK
// POST /api/tasks
// ======================================================

router.post("/", async (req, res) => {
    try {
        const { title, description, status, userId } = req.body;

        if (!title || !userId) {
            return res.status(400).json({
                message: "Title and userId are required"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const newTask = {
            title: title,
            description: description || "",
            status: status || "pending",
            userId: userId,
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
// GET ALL TASKS
// GET /api/tasks
// ======================================================

router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const allTasks = await tasks
            .find({})
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

router.get("/user/:userId", async (req, res) => {
    try {
        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const userTasks = await tasks
            .find({
                userId: req.params.userId
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

router.put("/:id", async (req, res) => {
    try {
        const { title, description, status } = req.body;

        const taskId = req.params.id;

        console.log("Updating task:", taskId);

        // Check if ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const result = await tasks.updateOne(
            {
                _id: new ObjectId(taskId)
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

        console.log("Matched:", result.matchedCount);
        console.log("Modified:", result.modifiedCount);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Task not found",
                taskId: taskId
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

router.delete("/:id", async (req, res) => {
    try {
        const taskId = req.params.id;

        console.log("Deleting task:", taskId);

        if (!ObjectId.isValid(taskId)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const db = req.app.locals.db;
        const tasks = db.collection("tasks");

        const result = await tasks.deleteOne({
            _id: new ObjectId(taskId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Task not found",
                taskId: taskId
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