
function createGoal({ userId, title }) {
  return {
    userId,
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
    completedAt: null,
  };
}

module.exports = { createGoal };
