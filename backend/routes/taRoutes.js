const express = require("express");
const prisma = require("../prisma/client");

const router = express.Router();

// =============================
// TA DASHBOARD SUMMARY
// =============================
router.get("/dashboard", async (req, res) => {
  try {
    const { customerName } = req.query;

    const [requisitions, offers, joiners] = await Promise.all([
      prisma.tARequisition.findMany({
        where: customerName ? { customerName } : undefined,
      }),
      prisma.tAOffer.findMany({
        where: customerName ? { customerName } : undefined,
      }),
      prisma.tAJoiner.findMany({
        where: customerName ? { customerName } : undefined,
      }),
    ]);

    const totalApprovedDemand = requisitions.reduce(
      (sum, r) => sum + (r.approvedPositions || 0),
      0
    );

    const openActivePositions = requisitions.filter(
      (r) => (r.requisitionStatus || "").toLowerCase() === "open"
    ).length;

    const positionsOnHold = requisitions.filter(
      (r) => (r.requisitionStatus || "").toLowerCase() === "on hold"
    ).length;

    const cancelledPositions = requisitions.filter(
      (r) => (r.requisitionStatus || "").toLowerCase() === "cancelled"
    ).length;

    const totalJoiners = joiners.filter(
      (j) => (j.joiningStatus || "").toLowerCase() === "joined"
    ).length;

    const offersAcceptedYetToJoin = offers.filter((o) => {
      const status = (o.offerStatus || "").toLowerCase();
      return status === "accepted" && !o.actualDoj;
    }).length;

    const offersInProgress = offers.filter((o) => {
      const status = (o.offerStatus || "").toLowerCase();
      return status === "pending" || status === "in process";
    }).length;

    const offersDeclined = offers.filter(
      (o) => (o.offerStatus || "").toLowerCase() === "declined"
    ).length;

    const now = new Date();
    const positionAgeingDays = requisitions
      .filter((r) => r.requisitionCreatedDate)
      .map((r) =>
        (now.getTime() - r.requisitionCreatedDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
    const avgPositionAgeing = positionAgeingDays.length
      ? Math.round(
          positionAgeingDays.reduce((a, b) => a + b, 0) /
            positionAgeingDays.length
        )
      : 0;

    const allCandidateDates = joiners
      .filter((j) => j.joiningDate)
      .map((j) => j.joiningDate.getTime());
    const avgTimeToStart = allCandidateDates.length
      ? 0 // left as 0 until we add offer accepted dates
      : 0;

    // Demand vs fulfilment by technology
    const techMap = new Map();
    requisitions.forEach((r) => {
      const key = r.technology || "Unknown";
      if (!techMap.has(key)) {
        techMap.set(key, {
          technology: key,
          approvedDemand: 0,
          joined: 0,
          offersAccepted: 0,
          inProgress: 0,
          openActive: 0,
          onHold: 0,
          cancelled: 0,
        });
      }
      const bucket = techMap.get(key);
      bucket.approvedDemand += r.approvedPositions || 0;
      const status = (r.requisitionStatus || "").toLowerCase();
      if (status === "open") bucket.openActive += 1;
      else if (status === "on hold") bucket.onHold += 1;
      else if (status === "cancelled") bucket.cancelled += 1;
    });

    // Joiner and offer information per technology
    joiners.forEach((j) => {
      const req = requisitions.find(
        (r) => r.requisitionId === j.requisitionId
      );
      const tech = (req && req.technology) || "Unknown";
      const bucket = techMap.get(tech) || techMap.set(tech, {
        technology: tech,
        approvedDemand: 0,
        joined: 0,
        offersAccepted: 0,
        inProgress: 0,
        openActive: 0,
        onHold: 0,
        cancelled: 0,
      }).get(tech);
      if ((j.joiningStatus || "").toLowerCase() === "joined") {
        bucket.joined += 1;
      }
    });

    offers.forEach((o) => {
      const req = requisitions.find(
        (r) => r.requisitionId === o.requisitionId
      );
      const tech = (req && req.technology) || "Unknown";
      const bucket = techMap.get(tech) || techMap.set(tech, {
        technology: tech,
        approvedDemand: 0,
        joined: 0,
        offersAccepted: 0,
        inProgress: 0,
        openActive: 0,
        onHold: 0,
        cancelled: 0,
      }).get(tech);

      const s = (o.offerStatus || "").toLowerCase();
      if (s === "accepted") bucket.offersAccepted += 1;
      else if (s === "pending" || s === "in process")
        bucket.inProgress += 1;
    });

    // Recruiter performance (simple derived snapshot)
    const recruiterMap = new Map();
    const allCandidates = await prisma.tACandidate.findMany();

    allCandidates.forEach((c) => {
      const key = c.recruiter || "Unassigned";
      if (!recruiterMap.has(key)) {
        recruiterMap.set(key, {
          recruiter: key,
          positionsAssigned: 0,
          profilesSubmitted: 0,
          interviewsScheduled: 0,
          offersReleased: 0,
          joiners: 0,
          avgTatDays: 0,
        });
      }
      const bucket = recruiterMap.get(key);
      bucket.profilesSubmitted += 1;
    });

    offers.forEach((o) => {
      const cand = allCandidates.find(
        (c) => c.candidateId === o.candidateId
      );
      const key = (cand && cand.recruiter) || "Unassigned";
      const bucket = recruiterMap.get(key);
      if (!bucket) return;
      bucket.offersReleased += 1;
      if ((o.offerStatus || "").toLowerCase() === "accepted") {
        bucket.joiners += 1; // counts accepted offers; actual joins in TAJoiner
      }
    });

    const recruiterPerformance = Array.from(recruiterMap.values());

    res.json({
      tiles: {
        totalApprovedDemand,
        totalJoiners,
        offersAcceptedYetToJoin,
        offersInProgress,
        offersDeclined,
        openActivePositions,
        positionsOnHold,
        cancelledPositions,
        avgPositionAgeing,
        avgProfileAgeing: 0,
        avgTimeToFill: 0,
        avgTimeToStart,
      },
      demandByTechnology: Array.from(techMap.values()),
      recruiterPerformance,
      ageingRisk: [],
    });
  } catch (err) {
    console.error("TA dashboard summary failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA TRACKER DATA
// =============================
router.get("/tracker", async (req, res) => {
  try {
    const { customerName } = req.query;

    const [requisitions, candidates, interviews, offers, joiners] =
      await Promise.all([
        prisma.tARequisition.findMany({
          where: customerName ? { customerName } : undefined,
          orderBy: { id: "asc" },
        }),
        prisma.tACandidate.findMany({
          where: customerName ? { customerName } : undefined,
          orderBy: { id: "asc" },
        }),
        prisma.tAInterview.findMany({
          where: customerName ? { customerName } : undefined,
          orderBy: { id: "asc" },
        }),
        prisma.tAOffer.findMany({
          where: customerName ? { customerName } : undefined,
          orderBy: { id: "asc" },
        }),
        prisma.tAJoiner.findMany({
          where: customerName ? { customerName } : undefined,
          orderBy: { id: "asc" },
        }),
      ]);

    res.json({
      requisitions,
      candidates,
      interviews,
      offers,
      joiners,
    });
  } catch (err) {
    console.error("TA tracker fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA REQUISITION INLINE EDITING
// =============================

router.post("/requisitions", async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.tARequisition.create({
      data: {
        requisitionId: data.requisitionId || "",
        jobTitle: data.jobTitle || "",
        hiringManager: data.hiringManager || null,
        technology: data.technology || null,
        approvedPositions: Number(data.approvedPositions) || 0,
        priority: data.priority || null,
        requisitionStatus: data.requisitionStatus || "Open",
      },
    });
    res.json(created);
  } catch (err) {
    console.error("TA requisition create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/requisitions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid requisition id" });
    }

    const data = req.body || {};
    const updated = await prisma.tARequisition.update({
      where: { id },
      data: {
        requisitionId: data.requisitionId || undefined,
        jobTitle: data.jobTitle || undefined,
        hiringManager: data.hiringManager ?? undefined,
        technology: data.technology ?? undefined,
        approvedPositions:
          data.approvedPositions !== undefined
            ? Number(data.approvedPositions) || 0
            : undefined,
        priority: data.priority ?? undefined,
        requisitionStatus: data.requisitionStatus || undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("TA requisition update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/requisitions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid requisition id" });

    await prisma.tARequisition.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("TA requisition delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA CANDIDATES
// =============================

router.post("/candidates", async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.tACandidate.create({
      data: {
        candidateId:
          data.candidateId || `${data.requisitionId || ""}-${data.candidateName || ""}`,
        requisitionId: data.requisitionId || "",
        candidateName: data.candidateName || "",
        recruiter: data.recruiter || null,
        source: data.source || null,
        profileStatus: data.profileStatus || null,
        currentStage: data.currentStage || null,
        candidateStatus: data.candidateStatus || null,
      },
    });
    res.json(created);
  } catch (err) {
    console.error("TA candidate create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid candidate id" });

    const data = req.body || {};
    const updated = await prisma.tACandidate.update({
      where: { id },
      data: {
        candidateId: data.candidateId || undefined,
        requisitionId: data.requisitionId || undefined,
        candidateName: data.candidateName || undefined,
        recruiter: data.recruiter ?? undefined,
        source: data.source ?? undefined,
        profileStatus: data.profileStatus ?? undefined,
        currentStage: data.currentStage ?? undefined,
        candidateStatus: data.candidateStatus ?? undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("TA candidate update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid candidate id" });

    await prisma.tACandidate.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("TA candidate delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA INTERVIEWS
// =============================

router.post("/interviews", async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.tAInterview.create({
      data: {
        candidateId: data.candidateId || "",
        requisitionId: data.requisitionId || "",
        interviewRound: data.interviewRound || null,
        interviewDate: data.interviewDate || null,
        feedbackDate: data.feedbackDate || null,
        interviewResult: data.interviewResult || null,
        interviewer: data.interviewer || null,
      },
    });
    res.json(created);
  } catch (err) {
    console.error("TA interview create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/interviews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid interview id" });

    const data = req.body || {};
    const updated = await prisma.tAInterview.update({
      where: { id },
      data: {
        candidateId: data.candidateId || undefined,
        requisitionId: data.requisitionId || undefined,
        interviewRound: data.interviewRound ?? undefined,
        interviewDate: data.interviewDate ?? undefined,
        feedbackDate: data.feedbackDate ?? undefined,
        interviewResult: data.interviewResult ?? undefined,
        interviewer: data.interviewer ?? undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("TA interview update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/interviews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid interview id" });

    await prisma.tAInterview.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("TA interview delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA OFFERS
// =============================

router.post("/offers", async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.tAOffer.create({
      data: {
        candidateId: data.candidateId || "",
        requisitionId: data.requisitionId || "",
        offerStatus: data.offerStatus || null,
        offerReleasedDate: data.offerReleasedDate || null,
        expectedDoj: data.expectedDoj || null,
        actualDoj: data.actualDoj || null,
        declineReason: data.declineReason || null,
      },
    });
    res.json(created);
  } catch (err) {
    console.error("TA offer create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/offers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid offer id" });

    const data = req.body || {};
    const updated = await prisma.tAOffer.update({
      where: { id },
      data: {
        candidateId: data.candidateId || undefined,
        requisitionId: data.requisitionId || undefined,
        offerStatus: data.offerStatus ?? undefined,
        offerReleasedDate: data.offerReleasedDate ?? undefined,
        expectedDoj: data.expectedDoj ?? undefined,
        actualDoj: data.actualDoj ?? undefined,
        declineReason: data.declineReason ?? undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("TA offer update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/offers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid offer id" });

    await prisma.tAOffer.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("TA offer delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// TA JOINERS
// =============================

router.post("/joiners", async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.tAJoiner.create({
      data: {
        candidateId: data.candidateId || "",
        requisitionId: data.requisitionId || "",
        joiningDate: data.joiningDate || null,
        joiningStatus: data.joiningStatus || null,
        onboardingStatus: data.onboardingStatus || null,
      },
    });
    res.json(created);
  } catch (err) {
    console.error("TA joiner create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/joiners/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid joiner id" });

    const data = req.body || {};
    const updated = await prisma.tAJoiner.update({
      where: { id },
      data: {
        candidateId: data.candidateId || undefined,
        requisitionId: data.requisitionId || undefined,
        joiningDate: data.joiningDate ?? undefined,
        joiningStatus: data.joiningStatus ?? undefined,
        onboardingStatus: data.onboardingStatus ?? undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("TA joiner update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/joiners/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid joiner id" });

    await prisma.tAJoiner.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("TA joiner delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
