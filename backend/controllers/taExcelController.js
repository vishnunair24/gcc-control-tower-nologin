const XLSX = require("xlsx");
const prisma = require("../prisma/client");

function normalizeHeader(h) {
  return String(h).toLowerCase().replace(/\s+/g, "").trim();
}

function parseDate(value) {
  if (!value) return null;
  if (typeof value === "number") {
    const utcDays = Math.floor(value - 25569);
    return new Date(utcDays * 86400 * 1000);
  }
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

exports.replaceTAFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    // ----- Sheet 1: Open Requisition Tracker -----
    const reqSheet =
      workbook.Sheets["Open_Requisition_Tracker"] ||
      workbook.Sheets[workbook.SheetNames[0]];

    const reqRows = XLSX.utils.sheet_to_json(reqSheet, {
      header: 1,
      defval: "",
    });

    if (reqRows.length < 2) {
      return res.status(400).json({ error: "Requisition sheet has no data rows" });
    }

    const reqHeaders = reqRows[0].map(normalizeHeader);
    const col = (headers, name) => headers.indexOf(name);

    const reqIdx = {
      jobId: col(reqHeaders, "jobid"),
      jobTitle: col(reqHeaders, "jobtitle"),
      hiringManager: col(reqHeaders, "hiringmanager"),
      technology: col(reqHeaders, "technology"),
      openPositions: col(reqHeaders, "openpositions"),
      status: col(reqHeaders, "status"),
      ageing: col(reqHeaders, "ageing(days)"), // optional, may be -1
      priority: col(reqHeaders, "priority"),
    };

    const taRequisitions = [];

    reqRows.slice(1).forEach((row) => {
      if (row.every((c) => String(c).trim() === "")) return;

      taRequisitions.push({
        requisitionId: row[reqIdx.jobId]?.toString().trim() || "",
        jobTitle: row[reqIdx.jobTitle]?.toString().trim() || "",
        hiringManager: row[reqIdx.hiringManager]?.toString().trim() || null,
        technology: row[reqIdx.technology]?.toString().trim() || null,
        recruiter: null,
        approvedPositions: Number(row[reqIdx.openPositions]) || 0,
        priority: row[reqIdx.priority]?.toString().trim() || null,
        requisitionStatus: row[reqIdx.status]?.toString().trim() || "Open",
        requisitionCreatedDate: null,
        targetClosureDate: null,
        location: null,
        businessUnit: null,
      });
    });

    // ----- Sheet 2: Candidate Pipeline -----
    const candSheet = workbook.Sheets["Candidate_Pipeline"];
    const taCandidates = [];

    if (candSheet) {
      const candRows = XLSX.utils.sheet_to_json(candSheet, {
        header: 1,
        defval: "",
      });
      if (candRows.length > 1) {
        const candHeaders = candRows[0].map(normalizeHeader);
        const cIdx = {
          jobId: col(candHeaders, "jobid"),
          candidateName: col(candHeaders, "candidatename"),
          recruiter: col(candHeaders, "recruiter"),
          taScreening: col(candHeaders, "tascreening"),
          hmScreening: col(candHeaders, "hmscreening"),
          int1: col(candHeaders, "int1"),
          int2: col(candHeaders, "int2"),
          advanced: col(candHeaders, "advanced"),
          currentStatus: col(candHeaders, "currentstatus"),
        };

        candRows.slice(1).forEach((row) => {
          if (row.every((c) => String(c).trim() === "")) return;

          const name = row[cIdx.candidateName]?.toString().trim() || "";
          if (!name) return;

          taCandidates.push({
            candidateId: `${row[cIdx.jobId] || ""}-${name}`,
            requisitionId: row[cIdx.jobId]?.toString().trim() || "",
            candidateName: name,
            recruiter: row[cIdx.recruiter]?.toString().trim() || null,
            source: null,
            profileReceivedDate: null,
            profileStatus: row[cIdx.currentStatus]?.toString().trim() || null,
            currentStage: row[cIdx.advanced]?.toString().trim() || null,
            stageEntryDate: null,
            candidateStatus: row[cIdx.currentStatus]?.toString().trim() || null,
          });
        });
      }
    }

    // ----- Sheet 3: Interview TAT -----
    const intSheet = workbook.Sheets["Interview_TAT"];
    const taInterviews = [];

    if (intSheet) {
      const intRows = XLSX.utils.sheet_to_json(intSheet, {
        header: 1,
        defval: "",
      });
      if (intRows.length > 1) {
        const intHeaders = intRows[0].map(normalizeHeader);
        const iIdx = {
          jobId: col(intHeaders, "jobid"),
          candidate: col(intHeaders, "candidate"),
          round: col(intHeaders, "interviewround"),
          interviewDate: col(intHeaders, "interviewdate"),
          feedbackDate: col(intHeaders, "feedbackdate"),
          status: col(intHeaders, "status"),
        };

        intRows.slice(1).forEach((row) => {
          if (row.every((c) => String(c).trim() === "")) return;

          taInterviews.push({
            interviewId: null,
            candidateId: row[iIdx.candidate]?.toString().trim() || "",
            requisitionId: row[iIdx.jobId]?.toString().trim() || "",
            interviewRound: row[iIdx.round]?.toString().trim() || null,
            interviewDate: parseDate(row[iIdx.interviewDate]),
            feedbackDate: parseDate(row[iIdx.feedbackDate]),
            interviewResult: row[iIdx.status]?.toString().trim() || null,
            interviewer: null,
          });
        });
      }
    }

    // ----- Sheet 4: Offer Lifecycle -----
    const offerSheet = workbook.Sheets["Offer_Lifecycle"];
    const taOffers = [];

    if (offerSheet) {
      const offerRows = XLSX.utils.sheet_to_json(offerSheet, {
        header: 1,
        defval: "",
      });
      if (offerRows.length > 1) {
        const offerHeaders = offerRows[0].map(normalizeHeader);
        const oIdx = {
          jobId: col(offerHeaders, "jobid"),
          candidate: col(offerHeaders, "candidate"),
          offerReleasedDate: col(offerHeaders, "offerreleaseddate"),
          offerStatus: col(offerHeaders, "offerstatus"),
          expectedDoj: col(offerHeaders, "expecteddoj"),
          actualDoj: col(offerHeaders, "actualdoj"),
          remarks: col(offerHeaders, "remarks"),
        };

        offerRows.slice(1).forEach((row) => {
          if (row.every((c) => String(c).trim() === "")) return;

          taOffers.push({
            offerId: null,
            candidateId: row[oIdx.candidate]?.toString().trim() || "",
            requisitionId: row[oIdx.jobId]?.toString().trim() || "",
            offerReleasedDate: parseDate(row[oIdx.offerReleasedDate]),
            offerStatus: row[oIdx.offerStatus]?.toString().trim() || null,
            offerAcceptedDate: null,
            expectedDoj: parseDate(row[oIdx.expectedDoj]),
            actualDoj: parseDate(row[oIdx.actualDoj]),
            declineReason: row[oIdx.remarks]?.toString().trim() || null,
          });
        });
      }
    }

    // ----- Sheet 5: Joiner Pipeline -----
    const joinSheet = workbook.Sheets["Joiner_Pipeline"];
    const taJoiners = [];

    if (joinSheet) {
      const joinRows = XLSX.utils.sheet_to_json(joinSheet, {
        header: 1,
        defval: "",
      });
      if (joinRows.length > 1) {
        const joinHeaders = joinRows[0].map(normalizeHeader);
        const jIdx = {
          hiringManager: col(joinHeaders, "hiringmanager"),
          jobId: col(joinHeaders, "jobid"),
          candidate: col(joinHeaders, "candidate"),
          offerAcceptedDate: col(joinHeaders, "offeraccepteddate"),
          doj: col(joinHeaders, "doj"),
          status: col(joinHeaders, "status"),
          dropRisk: col(joinHeaders, "droprisk"),
        };

        joinRows.slice(1).forEach((row) => {
          if (row.every((c) => String(c).trim() === "")) return;

          taJoiners.push({
            joinerId: null,
            candidateId: row[jIdx.candidate]?.toString().trim() || "",
            requisitionId: row[jIdx.jobId]?.toString().trim() || "",
            joiningDate: parseDate(row[jIdx.doj]),
            joiningStatus: row[jIdx.status]?.toString().trim() || null,
            onboardingStatus: row[jIdx.dropRisk]?.toString().trim() || null,
          });
        });
      }
    }

    // Persist all TA data in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const delReq = await tx.tARequisition.deleteMany();
      const delCand = await tx.tACandidate.deleteMany();
      const delInt = await tx.tAInterview.deleteMany();
      const delOffer = await tx.tAOffer.deleteMany();
      const delJoin = await tx.tAJoiner.deleteMany();

      const insReq = taRequisitions.length
        ? await tx.tARequisition.createMany({ data: taRequisitions })
        : { count: 0 };
      const insCand = taCandidates.length
        ? await tx.tACandidate.createMany({ data: taCandidates })
        : { count: 0 };
      const insInt = taInterviews.length
        ? await tx.tAInterview.createMany({ data: taInterviews })
        : { count: 0 };
      const insOffer = taOffers.length
        ? await tx.tAOffer.createMany({ data: taOffers })
        : { count: 0 };
      const insJoin = taJoiners.length
        ? await tx.tAJoiner.createMany({ data: taJoiners })
        : { count: 0 };

      return {
        deleted: {
          requisitions: delReq.count,
          candidates: delCand.count,
          interviews: delInt.count,
          offers: delOffer.count,
          joiners: delJoin.count,
        },
        inserted: {
          requisitions: insReq.count,
          candidates: insCand.count,
          interviews: insInt.count,
          offers: insOffer.count,
          joiners: insJoin.count,
        },
      };
    });

    res.json({
      message: "TA tracker data replaced from Excel",
      ...result,
    });
  } catch (err) {
    console.error("TA Excel replace failed:", err);
    res.status(500).json({ error: err.message });
  }
};
