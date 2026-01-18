const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3001;

const taskRoutes = require("./routes/taskRoutes");
const infraTaskRoutes = require("./routes/infraTaskRoutes");
const excelUploadRoutes = require("./routes/excelUploadRoutes");
const taRoutes = require("./routes/taRoutes");

const app = express();

// app.use(cors());
app.use(cors({ origin: "*" }));
app.use(express.json());

// =======================
// ROUTES
// =======================

// Program Tracker
app.use("/tasks", taskRoutes);

// Infra Setup Tracker
app.use("/infra-tasks", infraTaskRoutes);

// Excel Uploads (Program + Infra)
app.use("/excel", excelUploadRoutes);

// TA Dashboard + Tracker
app.use("/ta", taRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Backend running" });
});

// app.listen(4000, () => {
//   console.log("Server running on http://localhost:4000");
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
