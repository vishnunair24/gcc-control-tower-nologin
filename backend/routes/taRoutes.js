const express = require("express");
const prisma = require("../prisma/client");

const router = express.Router();

// =============================
// TA DASHBOARD SUMMARY
// =============================
router.get("/dashboard", async (req, res) => {
  try {
    const [requisitions, offers, joiners] = await Promise.all([
      prisma.tARequisition.findMany(),
      prisma.tAOffer.findMany(),
      prisma.tAJoiner.findMany(),
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
    const [requisitions, candidates, interviews, offers, joiners] =
      await Promise.all([
        prisma.tARequisition.findMany({ orderBy: { id: "asc" } }),
        prisma.tACandidate.findMany({ orderBy: { id: "asc" } }),
        prisma.tAInterview.findMany({ orderBy: { id: "asc" } }),
        prisma.tAOffer.findMany({ orderBy: { id: "asc" } }),
        prisma.tAJoiner.findMany({ orderBy: { id: "asc" } }),
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

module.exports = router;
