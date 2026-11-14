
function createChallenge({ userId, title, category }) {
  return {
    userId,
    title: title.trim(),
    category: category.trim(),
    target: 0,
    activities: [],
    status: "In Progress",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createActivity(title) {
  return {
    _id: new (require("mongodb").ObjectId)(),
    title: title.trim(),
    completed: false,
    completedAt: null,
    createdAt: new Date(),
  };
}

module.exports = { createChallenge, createActivity };

