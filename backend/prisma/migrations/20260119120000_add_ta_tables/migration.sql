-- Create TA tables

-- Requisition-level view
CREATE TABLE "TARequisition" (
    "id" SERIAL NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "technology" TEXT,
    "hiringManager" TEXT,
    "recruiter" TEXT,
    "approvedPositions" INTEGER NOT NULL DEFAULT 0,
    "priority" TEXT,
    "requisitionStatus" TEXT NOT NULL,
    "requisitionCreatedDate" TIMESTAMP(3),
    "targetClosureDate" TIMESTAMP(3),
    "location" TEXT,
    "businessUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TARequisition_pkey" PRIMARY KEY ("id")
);

-- Candidate-level view
CREATE TABLE "TACandidate" (
    "id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "recruiter" TEXT,
    "source" TEXT,
    "profileReceivedDate" TIMESTAMP(3),
    "profileStatus" TEXT,
    "currentStage" TEXT,
    "stageEntryDate" TIMESTAMP(3),
    "candidateStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TACandidate_pkey" PRIMARY KEY ("id")
);

-- Interview events and TAT
CREATE TABLE "TAInterview" (
    "id" SERIAL NOT NULL,
    "interviewId" TEXT,
    "candidateId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "interviewRound" TEXT,
    "interviewDate" TIMESTAMP(3),
    "feedbackDate" TIMESTAMP(3),
    "interviewResult" TEXT,
    "interviewer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TAInterview_pkey" PRIMARY KEY ("id")
);

-- Offer lifecycle
CREATE TABLE "TAOffer" (
    "id" SERIAL NOT NULL,
    "offerId" TEXT,
    "candidateId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "offerReleasedDate" TIMESTAMP(3),
    "offerStatus" TEXT,
    "offerAcceptedDate" TIMESTAMP(3),
    "expectedDoj" TIMESTAMP(3),
    "actualDoj" TIMESTAMP(3),
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TAOffer_pkey" PRIMARY KEY ("id")
);

-- Joiner pipeline
CREATE TABLE "TAJoiner" (
    "id" SERIAL NOT NULL,
    "joinerId" TEXT,
    "candidateId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3),
    "joiningStatus" TEXT,
    "onboardingStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TAJoiner_pkey" PRIMARY KEY ("id")
);

-- Monthly aggregate snapshot for TA exec dashboard
CREATE TABLE "TAExecMonthly" (
    "id" SERIAL NOT NULL,
    "snapshotMonth" TEXT NOT NULL,
    "technology" TEXT,
    "totalApproved" INTEGER NOT NULL DEFAULT 0,
    "joined" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "offersInProcess" INTEGER NOT NULL DEFAULT 0,
    "offersDeclined" INTEGER NOT NULL DEFAULT 0,
    "openActive" INTEGER NOT NULL DEFAULT 0,
    "onHold" INTEGER NOT NULL DEFAULT 0,
    "cancelled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TAExecMonthly_pkey" PRIMARY KEY ("id")
);

-- Monthly recruiter productivity snapshot
CREATE TABLE "TARecruiterMonthly" (
    "id" SERIAL NOT NULL,
    "snapshotMonth" TEXT NOT NULL,
    "recruiter" TEXT NOT NULL,
    "positionsAssigned" INTEGER NOT NULL DEFAULT 0,
    "profilesSubmitted" INTEGER NOT NULL DEFAULT 0,
    "interviewsScheduled" INTEGER NOT NULL DEFAULT 0,
    "offersReleased" INTEGER NOT NULL DEFAULT 0,
    "joiners" INTEGER NOT NULL DEFAULT 0,
    "avgTatDays" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TARecruiterMonthly_pkey" PRIMARY KEY ("id")
);
