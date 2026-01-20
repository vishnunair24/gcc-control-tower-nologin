const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Normalize Excel headers
 */
function normalizeHeader(h) {
  return String(h)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Convert Excel date safely
 */
function parseDate(value, fallback) {
  if (typeof value === "number") {
    const utcDays = Math.floor(value - 25569);
    return new Date(utcDays * 86400 * 1000);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const d = new Date(value);
    if (!isNaN(d)) return d;
  }

  return fallback;
}

/**
 * ============================
 * REPLACE INFRA TASKS FROM EXCEL
 * ============================
 * Endpoint: POST /excel/infra-replace
 * Table: InfraTask
 */
exports.replaceInfraFromExcel = async (req, res) => {
  console.log("🔥 INFRA EXCEL REPLACE STARTED");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (rows.length < 2) {
      return res.status(400).json({ error: "Excel has no data rows" });
    }

    // Normalize headers
    const headerRow = rows[0].map(normalizeHeader);

    const colIndex = (name) =>
      headerRow.findIndex((h) => h.includes(name));

    const idx = {
      infraPhase: colIndex("infra"),
      taskName: colIndex("task"),
      status: colIndex("status"),
      percentComplete: colIndex("complete"),
      startDate: colIndex("start"),
      endDate: colIndex("end"),
      owner: colIndex("owner"),
      // allow both "customerName" and "customer name"
      customerName: headerRow.findIndex(
        (h) => h.includes("customername") || h.includes("customer name")
      ),
    };

    const today = new Date();
    const tasks = [];

    rows.slice(1).forEach((row) => {
      if (row.every((c) => String(c).trim() === "")) return;

      const startDate = parseDate(row[idx.startDate], today);
      const endDate = parseDate(row[idx.endDate], startDate);

      const rawCustomer =
        idx.customerName >= 0
          ? String(row[idx.customerName] || "").trim()
          : "";

      tasks.push({
        infraPhase:
          row[idx.infraPhase]?.toString().trim() || "General",
        taskName:
          row[idx.taskName]?.toString().trim() || "TBD",
        status:
          row[idx.status]?.toString().trim() || "Planned",
        percentComplete:
          Number(row[idx.percentComplete]) || 0,
        startDate,
        endDate,
        owner:
          row[idx.owner]?.toString().trim() || "",
        customerName: rawCustomer || null,
      });
    });

    if (!tasks.length) {
      return res.status(400).json({
        error: "No valid Infra rows found in Excel",
      });
    }

    // Decide whether to replace for a specific customer or just append
    const viewCustomer = (req.query.customerName || "").trim();
    const excelCustomers = new Set(
      tasks
        .map((t) => (t.customerName || "").trim())
        .filter((c) => c !== "")
    );

    // If user is in a specific customer view, block uploads for other customers
    if (viewCustomer) {
      const customerList = Array.from(excelCustomers);

      if (customerList.length === 0) {
        return res.status(400).json({
          error:
            `This file does not contain any customerName values, but you are currently viewing '${viewCustomer}'. ` +
            "Please upload a file filtered for this customer or go back to the customer selection page and choose the correct customer.",
        });
      }

      if (!(customerList.length === 1 && customerList[0] === viewCustomer)) {
        return res.status(400).json({
          error:
            `This Excel looks to be for customer(s): ${customerList.join(", ")}, but you are currently viewing '${viewCustomer}'. ` +
            "Please go back to the customer selection page and choose the matching customer before uploading.",
        });
      }
    }

    let customerForReplace = null;
    if (viewCustomer && excelCustomers.size === 1 && excelCustomers.has(viewCustomer)) {
      customerForReplace = viewCustomer;
    } else if (!viewCustomer && excelCustomers.size === 1) {
      const [onlyCustomer] = Array.from(excelCustomers);
      customerForReplace = onlyCustomer || null;
    }

    const result = await prisma.$transaction(async (tx) => {
      let deleted = { count: 0 };

      if (customerForReplace) {
        deleted = await tx.infraTask.deleteMany({
          where: { customerName: customerForReplace },
        });
      }
      const inserted = await tx.infraTask.createMany({
        data: tasks,
      });

      return {
        deleted: deleted.count,
        inserted: inserted.count,
      };
    });

    res.json({
      message: "Infra Excel replaced successfully",
      ...result,
      rowsRead: rows.length - 1,
    });
  } catch (err) {
    console.error("❌ INFRA EXCEL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
