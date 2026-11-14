
const express = require("express");
const { ObjectId } = require("mongodb");
const {
  createChallenge,
  createActivity,
} = require("../models/challengeModel");

function createChallengeRouter(db, requireAuth) {
  const router = express.Router();
  const challenges = db.collection("challenges");

  router.use(requireAuth);

  function validId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  function updateProgress(challenge) {
    const total = challenge.activities.length;
    const completed = challenge.activities.filter(
      (activity) => activity.completed
    ).length;

    challenge.target = total;
    challenge.status =
      total > 0 && completed === total
        ? "Completed"
        : "In Progress";

    challenge.updatedAt = new Date();
    return challenge;
  }

  // GET ALL CHALLENGES
  router.get("/", async (req, res) => {
    try {
      const result = await challenges
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({
        message: "Challenges retrieved successfully",
        challenges: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to retrieve challenges",
      });
    }
  });

  // CREATE CHALLENGE
  router.post("/", async (req, res) => {
    try {
      const { title, category } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 150
      ) {
        return res.status(400).json({
          message: "Title must contain 1–150 characters",
        });
      }

      if (
        typeof category !== "string" ||
        !category.trim() ||
        category.trim().length > 60
      ) {
        return res.status(400).json({
          message: "Category must contain 1–60 characters",
        });
      }

      const challenge = createChallenge({
        userId: req.user.id,
        title,
        category,
      });

      const result = await challenges.insertOne(challenge);

      res.status(201).json({
        message: "Challenge created successfully",
        challenge: {
          ...challenge,
          _id: result.insertedId,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create challenge",
      });
    }
  });

  // ADD ACTIVITY
  router.post("/:id/activities", async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      if (!validId(id)) {
        return res.status(400).json({
          message: "Invalid challenge ID",
        });
      }

      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 150
      ) {
        return res.status(400).json({
          message: "Activity title must contain 1–150 characters",
        });
      }

      const activity = createActivity(title);

      // Atomic append, including the new target count.
      const result = await challenges.findOneAndUpdate(
        {
          _id: new ObjectId(id),
          userId: req.user.id,
        },
        [
          {
            $set: {
              activities: {
                $concatArrays: ["$activities", [activity]],
              },
              target: {
                $add: [{ $size: "$activities" }, 1],
              },
              status: "In Progress",
              updatedAt: new Date(),
            },
          },
        ],
        { returnDocument: "after" }
      );

      if (!result) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      }

      res.status(201).json({
        message: "Activity added successfully",
        challenge: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to add activity",
      });
    }
  });

  // COMPLETE OR UNCHECK ACTIVITY
  router.patch(
    "/:id/activities/:activityId",
    async (req, res) => {
      try {
        const { id, activityId } = req.params;
        const { completed } = req.body;

        if (!validId(id) || !validId(activityId)) {
          return res.status(400).json({
            message: "Invalid challenge or activity ID",
          });
        }

        if (typeof completed !== "boolean") {
          return res.status(400).json({
            message: "Completed must be true or false",
          });
        }

        const filter = {
          _id: new ObjectId(id),
          userId: req.user.id,
          "activities._id": new ObjectId(activityId),
        };

        // Use an atomic pipeline update to avoid overwriting
        // another activity change made at the same time.
        const now = new Date();

        const result = await challenges.findOneAndUpdate(
          filter,
          [
            {
              $set: {
                activities: {
                  $map: {
                    input: "$activities",
                    as: "activity",
                    in: {
                      $cond: [
                        {
                          $eq: [
                            "$$activity._id",
                            new ObjectId(activityId),
                          ],
                        },
                        {
                          $mergeObjects: [
                            "$$activity",
                            {
                              completed,
                              completedAt: completed ? now : null,
                            },
                          ],
                        },
                        "$$activity",
                      ],
                    },
                  },
                },
                updatedAt: now,
              },
            },
            {
              $set: {
                target: { $size: "$activities" },
                status: {
                  $cond: [
                    {
                      $and: [
                        { $gt: [{ $size: "$activities" }, 0] },
                        {
                          $allElementsTrue: {
                            $map: {
                              input: "$activities",
                              as: "activity",
                              in: "$$activity.completed",
                            },
                          },
                        },
                      ],
                    },
                    "Completed",
                    "In Progress",
                  ],
                },
              },
            },
          ],
          { returnDocument: "after" }
        );

        if (!result) {
          return res.status(404).json({
            message: "Challenge or activity not found",
          });
        }

        res.json({
          message: "Activity updated successfully",
          challenge: result,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Failed to update activity",
        });
      }
    }
  );

  // DELETE ACTIVITY
  router.delete(
    "/:id/activities/:activityId",
    async (req, res) => {
      try {
        const { id, activityId } = req.params;

        if (!validId(id) || !validId(activityId)) {
          return res.status(400).json({
            message: "Invalid challenge or activity ID",
          });
        }

        const result = await challenges.findOneAndUpdate(
          {
            _id: new ObjectId(id),
            userId: req.user.id,
            "activities._id": new ObjectId(activityId),
          },
          [
            {
              $set: {
                activities: {
                  $filter: {
                    input: "$activities",
                    as: "activity",
                    cond: {
                      $ne: [
                        "$$activity._id",
                        new ObjectId(activityId),
                      ],
                    },
                  },
                },
                updatedAt: new Date(),
              },
            },
            {
              $set: {
                target: { $size: "$activities" },
                status: {
                  $cond: [
                    {
                      $and: [
                        { $gt: [{ $size: "$activities" }, 0] },
                        {
                          $allElementsTrue: {
                            $map: {
                              input: "$activities",
                              as: "activity",
                              in: "$$activity.completed",
                            },
                          },
                        },
                      ],
                    },
                    "Completed",
                    "In Progress",
                  ],
                },
              },
            },
          ],
          { returnDocument: "after" }
        );

        if (!result) {
          return res.status(404).json({
            message: "Challenge or activity not found",
          });
        }

        res.json({
          message: "Activity deleted successfully",
          challenge: result,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Failed to delete activity",
        });
      }
    }
  );

  // DELETE CHALLENGE
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          message: "Invalid challenge ID",
        });
      }

      const result = await challenges.deleteOne({
        _id: new ObjectId(id),
        userId: req.user.id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "Challenge not found",
        });
      }

      res.json({
        message: "Challenge deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete challenge",
      });
    }
  });

  return router;
}

module.exports = createChallengeRouter;
