

const express = require("express");
const { ObjectId } = require("mongodb");
const { createGoal } = require("../models/goalModel");

function createGoalRouter(db, requireAuth) {
  const router = express.Router();
  const goals = db.collection("goals");

  router.use(requireAuth);

  // GET all goals for the logged-in user
  router.get("/", async (req, res) => {
    try {
      const result = await goals
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch goals",
      });
    }
  });

  // POST create a new goal
  router.post("/", async (req, res) => {
    try {
      const { title } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 150
      ) {
        return res.status(400).json({
          message: "Enter a goal title (1–150 characters)",
        });
      }

      const goal = createGoal({
        userId: req.user.id,
        title,
      });

      const result = await goals.insertOne(goal);

      res.status(201).json({
        ...goal,
        _id: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create goal",
      });
    }
  });

  // PATCH update goal completion
  router.patch("/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid goal ID",
        });
      }

      if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({
          message: "completed must be true or false",
        });
      }

      const result = await goals.findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id),
          userId: req.user.id,
        },
        {
          $set: {
            completed: req.body.completed,
            completedAt: req.body.completed
              ? new Date()
              : null,
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to update goal",
      });
    }
  });

  // DELETE a goal
  router.delete("/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid goal ID",
        });
      }

      const result = await goals.deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.user.id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "Goal not found",
        });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete goal",
      });
    }
  });

  return router;
}

module.exports = createGoalRouter;
