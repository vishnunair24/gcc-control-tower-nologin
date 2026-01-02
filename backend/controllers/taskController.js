const prisma = require("../prisma/client");

// GET all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { id: "asc" },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE task
exports.createTask = async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE task (inline edit save)
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
