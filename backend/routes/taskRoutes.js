const express = require("express");
const router = express.Router();

const {
  getTasks,
  updateTask,
} = require("../controllers/taskController");

const prisma = require("../prisma/client");

// =======================
// Routes
// =======================

// Get all tasks
router.get("/", getTasks);

// Update task (edit from tracker)
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.task.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    console.error("❌ Delete task failed:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

/* =======================
   CREATE TASK (ADD ROW)
   ======================= */
router.post("/", async (req, res) => {
  try {
    const {
      workstream,
      deliverable,
      status,
      progress,
      phase,
      milestone,
      startDate,
      endDate,
      owner,
    } = req.body;

    // ✅ SAFELY DERIVE DURATION
    let duration = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffMs = end - start;
      duration = diffMs >= 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    }

    const task = await prisma.task.create({
      data: {
        workstream,
        deliverable,
        status,
        progress,
        phase,
        milestone,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        duration, // ✅ FIXED
        owner,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Create task failed:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

module.exports = router;
