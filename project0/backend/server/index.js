
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const requireAuth = require("./middleware/requireAuth");
const createChallengeRouter = require("../server/routes/challengeRoute")
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = 8080;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let userCollection;
let goalsCollection;
let projectsCollection;
let projectTasksCollection;

// HOME
app.get("/", (req, res) => {
  res.send("<p>Hello from Node backend</p>");
});

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: normalizedEmail,
      password: hashPassword,
      createdAt: new Date(),
    };

    await userCollection.insertOne(newUser);

    return res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userCollection.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// AUTHENTICATED USER
app.get("/api/auth/me", requireAuth, async (req, res) => {
  return res.status(200).json({
    message: "You are authenticated",
    userId: req.user.id,
  });
});

// CREATE GOAL
app.post("/api/goals", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Goal title is required",
      });
    }

    const newGoal = {
      userId: req.user.id,
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
    };

    const result = await goalsCollection.insertOne(newGoal);

    return res.status(201).json({
      message: "Goal created successfully",
      goal: {
        ...newGoal,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create goal error:", error);

    return res.status(500).json({
      message: "Unable to create goal",
    });
  }
});

// GET GOALS
app.get("/api/goals", requireAuth, async (req, res) => {
  try {
    const goals = await goalsCollection
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      message: "Goals retrieved successfully",
      goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);

    return res.status(500).json({
      message: "Unable to retrieve goals",
    });
  }
});

// UPDATE GOAL
app.patch("/api/goals/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid goal ID",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "Completed must be true or false",
      });
    }

    const result = await goalsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: req.user.id,
      },
      {
        $set: {
          completed,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      message: "Goal updated successfully",
      goal: result,
    });
  } catch (error) {
    console.error("Update goal error:", error);

    return res.status(500).json({
      message: "Unable to update goal",
    });
  }
});

// DELETE GOAL
app.delete("/api/goals/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid goal ID",
      });
    }

    const result = await goalsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    return res.status(500).json({
      message: "Unable to delete goal",
    });
  }
});

// CREATE PROJECT
app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Project title is required",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    const newProject = {
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      status: "In Progress",
      progress: 0,
      createdAt: new Date(),
    };

    const result = await projectsCollection.insertOne(newProject);

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        ...newProject,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Failed to create project",
    });
  }
});

// GET PROJECTS
app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    const projects = await projectsCollection
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Failed to retrieve projects",
    });
  }
});

// UPDATE PROJECT
app.patch("/api/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Project title cannot be empty",
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          message: "Description must be a string",
        });
      }
      updates.description = description.trim();
    }

    if (status !== undefined) {
      if (!["In Progress", "Completed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid project status",
        });
      }

      updates.status = status;
      updates.progress = status === "Completed" ? 100 : 0;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided",
      });
    }

    updates.updatedAt = new Date();

    const result = await projectsCollection.updateOne(
      {
        _id: new ObjectId(id),
        userId: req.user.id,
      },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const updatedProject = await projectsCollection.findOne({
      _id: new ObjectId(id),
      userId: req.user.id,
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      message: "Failed to update project",
    });
  }
});

// DELETE PROJECT
app.delete("/api/projects/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const result = await projectsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
});

// CREATE PROJECT TASK
app.post(
  "/api/projects/:projectId/tasks",
  requireAuth,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { title } = req.body;

      if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title is required",
        });
      }

      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
        userId: req.user.id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const newTask = {
        projectId: project._id,
        userId: req.user.id,
        title: title.trim(),
        completed: false,
        createdAt: new Date(),
      };

      const result = await projectTasksCollection.insertOne(newTask);

      return res.status(201).json({
        message: "Project task created successfully",
        task: {
          ...newTask,
          _id: result.insertedId,
        },
      });
    } catch (error) {
      console.error("Create project task error:", error);

      return res.status(500).json({
        message: "Failed to create project task",
      });
    }
  }
);

// GET PROJECT TASKS
app.get(
  "/api/projects/:projectId/tasks",
  requireAuth,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
        userId: req.user.id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const tasks = await projectTasksCollection
        .find({
          projectId: project._id,
          userId: req.user.id,
        })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({
        message: "Project tasks retrieved successfully",
        tasks,
      });
    } catch (error) {
      console.error("Get project tasks error:", error);

      return res.status(500).json({
        message: "Failed to retrieve project tasks",
      });
    }
  }
);

// UPDATE PROJECT TASK
app.patch(
  "/api/projects/:projectId/tasks/:taskId",
  requireAuth,
  async (req, res) => {
    try {
      const { projectId, taskId } = req.params;
      const { completed } = req.body;

      if (
        !ObjectId.isValid(projectId) ||
        !ObjectId.isValid(taskId)
      ) {
        return res.status(400).json({
          message: "Invalid project or task ID",
        });
      }

      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be true or false",
        });
      }

      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
        userId: req.user.id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const result = await projectTasksCollection.updateOne(
        {
          _id: new ObjectId(taskId),
          projectId: project._id,
          userId: req.user.id,
        },
        {
          $set: {
            completed,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      const updatedTask = await projectTasksCollection.findOne({
        _id: new ObjectId(taskId),
        projectId: project._id,
        userId: req.user.id,
      });

      return res.status(200).json({
        message: "Project task updated successfully",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Update project task error:", error);

      return res.status(500).json({
        message: "Failed to update project task",
      });
    }
  }
);

// DELETE PROJECT TASK
app.delete(
  "/api/projects/:projectId/tasks/:taskId",
  requireAuth,
  async (req, res) => {
    try {
      const { projectId, taskId } = req.params;

      if (
        !ObjectId.isValid(projectId) ||
        !ObjectId.isValid(taskId)
      ) {
        return res.status(400).json({
          message: "Invalid project or task ID",
        });
      }

      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
        userId: req.user.id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      const result = await projectTasksCollection.deleteOne({
        _id: new ObjectId(taskId),
        projectId: project._id,
        userId: req.user.id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      return res.status(200).json({
        message: "Project task deleted successfully",
      });
    } catch (error) {
      console.error("Delete project task error:", error);

      return res.status(500).json({
        message: "Failed to delete project task",
      });
    }
  }
);

// CONNECT MONGODB AND START SERVER
async function connectDB() {
  try {
    await client.connect();

    const db = client.db("focusDB");

    userCollection = db.collection("focusUsers");
    goalsCollection = db.collection("focusGoals");
    projectsCollection = db.collection("projects");
    projectTasksCollection = db.collection("projectTasks");

    // CHALLENGES ROUTES
    app.use(
      "/api/challenges",
      createChallengeRouter(db, requireAuth)
    );

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(
        `Backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

connectDB();
