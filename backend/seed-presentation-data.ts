import { db } from "./src/config/database";
import * as schema from "./src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("Starting presentation data seeding...");

  try {
    // 1. Fetch key users
    const [seekerUser] = await db.select().from(schema.users).where(eq(schema.users.email, "kasunp12@gmail.com")).limit(1);
    const [interviewerUser] = await db.select().from(schema.users).where(eq(schema.users.email, "supuni00@gmail.com")).limit(1);
    const [adminUser] = await db.select().from(schema.users).where(eq(schema.users.email, "admin@inter.com")).limit(1);

    if (!seekerUser || !interviewerUser || !adminUser) {
      console.error("Required test users not found! Make sure kasunp12@gmail.com, supuni00@gmail.com, and admin@inter.com exist.");
      process.exit(1);
    }

    console.log(`Found users: Seeker ID=${seekerUser.id}, Interviewer ID=${interviewerUser.id}, Admin ID=${adminUser.id}`);

    // 2. Ensure jobSeekers row exists
    let [seekerProfile] = await db.select().from(schema.jobSeekers).where(eq(schema.jobSeekers.userId, seekerUser.id)).limit(1);
    if (!seekerProfile) {
      console.log("Creating job seeker profile...");
      const [newSeeker] = await db.insert(schema.jobSeekers).values({
        userId: seekerUser.id,
        university: "University of Moratuwa",
        graduationYear: 2024,
        fieldOfStudy: "Computer Science & Engineering",
        targetIndustries: "Software Engineering, AI",
        careerGoals: "Seeking a Software Engineer position at a top tier tech company.",
        preferredLanguage: "english",
      }).returning();
      seekerProfile = newSeeker;
    }

    // 3. Ensure interviewer row exists
    let [interviewerProfile] = await db.select().from(schema.interviewers).where(eq(schema.interviewers.userId, interviewerUser.id)).limit(1);
    if (!interviewerProfile) {
      console.log("Creating interviewer profile...");
      const [newInterviewer] = await db.insert(schema.interviewers).values({
        userId: interviewerUser.id,
        currentCompany: "WSO2",
        jobTitle: "Senior Software Engineer",
        yearsExperience: 6,
        industryExpertise: "Backend Architecture, Distributed Systems",
        linkedinProfile: "https://linkedin.com/in/supuni-interviewer-mock",
        hourlyRate: "4500.00",
        bio: "Senior Backend Developer with a passion for clean architecture and teaching. Ready to help you ace your system design and coding mock interviews.",
        isVerified: true,
        verificationStatus: "approved",
        verifiedAt: new Date(),
        ratingAverage: "4.85",
        totalInterviews: 12,
        totalEarnings: "43200.00",
        preferredMeetingPlatform: "zoom",
      }).returning();
      interviewerProfile = newInterviewer;
    }

    console.log("Updating interviewer stats...");
    await db.update(schema.interviewers).set({
      ratingAverage: "5.00",
      totalEarnings: "43200.00",
      isVerified: true,
      verificationStatus: "approved",
    }).where(eq(schema.interviewers.id, interviewerProfile.id));

    // 4. Ensure admin row exists
    let [adminProfile] = await db.select().from(schema.admins).where(eq(schema.admins.userId, adminUser.id)).limit(1);
    if (!adminProfile) {
      console.log("Creating admin profile...");
      const [newAdmin] = await db.insert(schema.admins).values({
        userId: adminUser.id,
        adminLevel: "super_admin",
        permissions: "all",
      }).returning();
      adminProfile = newAdmin;
    }

    // 5. Ensure industries exist
    let [industry] = await db.select().from(schema.industries).where(eq(schema.industries.industryName, "Software Engineering")).limit(1);
    if (!industry) {
      console.log("Creating Software Engineering industry...");
      const [newInd] = await db.insert(schema.industries).values({
        industryName: "Software Engineering",
        description: "Coding, systems design, software development methodologies, and technical algorithms.",
        isActive: true,
        displayOrder: 1,
      }).returning();
      industry = newInd;
    }

    // 6. Ensure availability slots exist
    const existingSlots = await db.select().from(schema.availabilitySlots).where(eq(schema.availabilitySlots.interviewerId, interviewerProfile.id)).limit(1);
    if (existingSlots.length === 0) {
      console.log("Creating availability slots for interviewer...");
      await db.insert(schema.availabilitySlots).values([
        { interviewerId: interviewerProfile.id, dayOfWeek: "monday", startTime: "17:00:00", endTime: "19:00:00", isRecurring: true },
        { interviewerId: interviewerProfile.id, dayOfWeek: "wednesday", startTime: "18:00:00", endTime: "20:00:00", isRecurring: true },
        { interviewerId: interviewerProfile.id, dayOfWeek: "saturday", startTime: "09:00:00", endTime: "12:00:00", isRecurring: true },
      ]);
    }

    // 7. Clear old sessions to make room for clean presentation data
    console.log("Cleaning up old session tables for this seeker/interviewer...");
    // We fetch sessions we created to remove them safely
    const oldSessions = await db.select().from(schema.interviewSessions).where(
      and(
        eq(schema.interviewSessions.jobSeekerId, seekerProfile.id),
        eq(schema.interviewSessions.interviewerId, interviewerProfile.id)
      )
    );
    for (const session of oldSessions) {
      await db.delete(schema.interviewerEarnings).where(eq(schema.interviewerEarnings.sessionId, session.id));
      await db.delete(schema.payments).where(eq(schema.payments.sessionId, session.id));
      await db.delete(schema.sessionFeedback).where(eq(schema.sessionFeedback.sessionId, session.id));
      await db.delete(schema.interviewerReviews).where(eq(schema.interviewerReviews.sessionId, session.id));
      await db.delete(schema.interviewSessions).where(eq(schema.interviewSessions.id, session.id));
    }

    // 8. Create Mock Sessions
    console.log("Creating Mock Sessions...");
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);

    // Session 1: Completed, 3 Days Ago
    const [sessionCompleted1] = await db.insert(schema.interviewSessions).values({
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      industryId: industry.id,
      sessionType: "technical",
      scheduledDate: threeDaysAgo,
      duration: 60,
      meetingLink: "https://zoom.us/j/9988776655",
      sessionStatus: "completed",
      priceAmount: "4500.00",
      notes: "Prepared for System Design mockup. Please focus on database sharding and scaling.",
    }).returning();

    // Session 2: Completed, 1 Day Ago
    const [sessionCompleted2] = await db.insert(schema.interviewSessions).values({
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      industryId: industry.id,
      sessionType: "behavioral",
      scheduledDate: oneDayAgo,
      duration: 60,
      meetingLink: "https://zoom.us/j/9988776644",
      sessionStatus: "completed",
      priceAmount: "4500.00",
      notes: "Prepared for leadership principles mock interview.",
    }).returning();

    // Session 3: Scheduled (Upcoming Tomorrow)
    const [sessionScheduled] = await db.insert(schema.interviewSessions).values({
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      industryId: industry.id,
      sessionType: "mixed",
      scheduledDate: tomorrow,
      duration: 60,
      meetingLink: "https://zoom.us/j/1122334455",
      sessionStatus: "scheduled",
      priceAmount: "4500.00",
      notes: "Focusing on both coding algorithms and behavioral fit questions.",
    }).returning();

    // Session 4: Pending (Needs Confirmation)
    const [sessionPending] = await db.insert(schema.interviewSessions).values({
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      industryId: industry.id,
      sessionType: "case_study",
      scheduledDate: nextWeek,
      duration: 60,
      sessionStatus: "pending",
      priceAmount: "4500.00",
      notes: "Case study practice for architecture evaluation.",
    }).returning();

    console.log("Mock Sessions created!");

    // 9. Create Payments
    console.log("Creating Payments...");
    const [pay1] = await db.insert(schema.payments).values({
      sessionId: sessionCompleted1.id,
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      amount: "4500.00",
      platformCommission: "900.00",
      interviewerPayout: "3600.00",
      paymentMethod: "VISA",
      payhereOrderId: `ORD-${sessionCompleted1.id}`,
      payhereTransactionId: `TXN-${sessionCompleted1.id}-ABC`,
      paymentStatus: "completed",
      paymentDate: threeDaysAgo,
    }).returning();

    const [pay2] = await db.insert(schema.payments).values({
      sessionId: sessionCompleted2.id,
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      amount: "4500.00",
      platformCommission: "900.00",
      interviewerPayout: "3600.00",
      paymentMethod: "MASTERCARD",
      payhereOrderId: `ORD-${sessionCompleted2.id}`,
      payhereTransactionId: `TXN-${sessionCompleted2.id}-XYZ`,
      paymentStatus: "completed",
      paymentDate: oneDayAgo,
    }).returning();

    await db.insert(schema.payments).values({
      sessionId: sessionScheduled.id,
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      amount: "4500.00",
      platformCommission: "900.00",
      interviewerPayout: "3600.00",
      paymentMethod: "VISA",
      payhereOrderId: `ORD-${sessionScheduled.id}`,
      payhereTransactionId: `TXN-${sessionScheduled.id}-QWE`,
      paymentStatus: "completed",
      paymentDate: new Date(),
    });

    await db.insert(schema.payments).values({
      sessionId: sessionPending.id,
      jobSeekerId: seekerProfile.id,
      interviewerId: interviewerProfile.id,
      amount: "4500.00",
      platformCommission: "900.00",
      interviewerPayout: "3600.00",
      paymentMethod: "VISA",
      payhereOrderId: `ORD-${sessionPending.id}`,
      paymentStatus: "pending",
    });

    console.log("Payments created!");

    // Ensure monthly payout exists
    let payoutId: number;
    const [existingPayout] = await db.select().from(schema.interviewerPayouts).where(
      and(
        eq(schema.interviewerPayouts.interviewerId, interviewerProfile.id),
        eq(schema.interviewerPayouts.payoutMonth, "2026-06")
      )
    ).limit(1);

    if (!existingPayout) {
      console.log("Creating Monthly Payout record...");
      const [newPayout] = await db.insert(schema.interviewerPayouts).values({
        interviewerId: interviewerProfile.id,
        payoutMonth: "2026-06",
        totalSessions: 2,
        totalHours: "2.00",
        grossAmount: "9000.00",
        commissionDeducted: "1800.00",
        netPayoutAmount: "7200.00",
        payoutStatus: "paid", // Set to paid (Released)
        bankAccountNumber: "LK-0098-1234-5678-01",
      }).returning();
      payoutId = newPayout.id;
    } else {
      payoutId = existingPayout.id;
      // Make sure the existing payout is marked as paid
      await db.update(schema.interviewerPayouts)
        .set({ payoutStatus: "paid" })
        .where(eq(schema.interviewerPayouts.id, payoutId));
    }

    // 10. Create Interviewer Earnings
    console.log("Creating Interviewer Earnings...");
    await db.insert(schema.interviewerEarnings).values([
      {
        interviewerId: interviewerProfile.id,
        sessionId: sessionCompleted1.id,
        paymentId: pay1.id,
        grossAmount: "4500.00",
        commissionDeducted: "900.00",
        netEarning: "3600.00",
        sessionDurationHours: "1.00",
        payoutMonth: "2026-06",
        payoutId: payoutId,
        earnedAt: threeDaysAgo,
      },
      {
        interviewerId: interviewerProfile.id,
        sessionId: sessionCompleted2.id,
        paymentId: pay2.id,
        grossAmount: "4500.00",
        commissionDeducted: "900.00",
        netEarning: "3600.00",
        sessionDurationHours: "1.00",
        payoutMonth: "2026-06",
        payoutId: payoutId,
        earnedAt: oneDayAgo,
      }
    ]);

    // 11. Create Session Feedback & Reviews
    console.log("Creating Feedback & Reviews...");
    await db.insert(schema.sessionFeedback).values([
      {
        sessionId: sessionCompleted1.id,
        interviewerId: interviewerProfile.id,
        jobSeekerId: seekerProfile.id,
        overallRating: 5,
        communicationRating: 5,
        technicalRating: 5,
        problemSolvingRating: 5,
        confidenceRating: 5,
        strengths: "Excellent coding speed and strong algorithm knowledge. Solved the array partitioning puzzle efficiently.",
        weaknesses: "Struggled a bit with explaining the scale of database replicas. Confidence level dropped when asked about CAP theorem tradeoffs.",
        improvementTips: "Practice high-level system design topics and study multi-leader replication setups. Talk through your system blueprints aloud.",
        generalComments: "Great potential. With more design practice, Kasun will be a very strong candidate.",
        isVisible: true,
        createdAt: threeDaysAgo,
      },
      {
        sessionId: sessionCompleted2.id,
        interviewerId: interviewerProfile.id,
        jobSeekerId: seekerProfile.id,
        overallRating: 5,
        communicationRating: 5,
        technicalRating: 5,
        problemSolvingRating: 5,
        confidenceRating: 5,
        strengths: "Very strong communication skills. Responded perfectly to behavioral questions using the STAR framework.",
        weaknesses: "None major. Minor detail: keep responses slightly more concise to fit within interview time limits.",
        improvementTips: "Maintain this structured response style. You are ready.",
        generalComments: "Fantastic behavioral session. Kasun was highly articulate and authentic.",
        isVisible: true,
        createdAt: oneDayAgo,
      }
    ]);

    await db.insert(schema.interviewerReviews).values([
      {
        sessionId: sessionCompleted1.id,
        jobSeekerId: seekerProfile.id,
        interviewerId: interviewerProfile.id,
        rating: 5,
        reviewText: "Supuni gave extremely helpful tips on backend design. The system design mock was tough but eye-opening!",
        isKnowledgeable: true,
        isHelpful: true,
        isActionable: true,
        isProfessional: true,
        createdAt: threeDaysAgo,
      },
      {
        sessionId: sessionCompleted2.id,
        jobSeekerId: seekerProfile.id,
        interviewerId: interviewerProfile.id,
        rating: 5,
        reviewText: "Very constructive feedback on my behavioral interview layout. Highly recommended mentor!",
        isKnowledgeable: true,
        isHelpful: true,
        isActionable: true,
        isProfessional: true,
        createdAt: oneDayAgo,
      }
    ]);

    // 12. Create Support Tickets
    console.log("Creating Support Tickets...");
    // Clean old tickets for these users first to keep clean presentation
    const oldTickets = await db.select().from(schema.supportTickets).where(
      eq(schema.supportTickets.userId, seekerUser.id)
    );
    for (const ticket of oldTickets) {
      await db.delete(schema.ticketMessages).where(eq(schema.ticketMessages.ticketId, ticket.id));
      await db.delete(schema.supportTickets).where(eq(schema.supportTickets.id, ticket.id));
    }
    
    const oldInterviewerTickets = await db.select().from(schema.supportTickets).where(
      eq(schema.supportTickets.userId, interviewerUser.id)
    );
    for (const ticket of oldInterviewerTickets) {
      await db.delete(schema.ticketMessages).where(eq(schema.ticketMessages.ticketId, ticket.id));
      await db.delete(schema.supportTickets).where(eq(schema.supportTickets.id, ticket.id));
    }

    // Seeker Ticket 1 (Resolved)
    const [ticket1] = await db.insert(schema.supportTickets).values({
      userId: seekerUser.id,
      subject: "Payment failed on checkout",
      description: "My visa card was declined multiple times during mock session checkout.",
      status: "resolved",
      priority: "high",
      createdAt: threeDaysAgo,
    }).returning();

    await db.insert(schema.ticketMessages).values([
      { ticketId: ticket1.id, senderId: seekerUser.id, message: "I tried booking a slot but the payment failed. Can you help?", createdAt: threeDaysAgo },
      { ticketId: ticket1.id, senderId: adminUser.id, message: "Hi Kasun! We checked the logs. It looks like PayHere sandbox was refreshing. Please try again now, it should proceed.", createdAt: oneDayAgo },
      { ticketId: ticket1.id, senderId: seekerUser.id, message: "Thanks! It went through successfully.", createdAt: oneDayAgo }
    ]);

    // Seeker Ticket 2 (Open)
    const [ticket2] = await db.insert(schema.supportTickets).values({
      userId: seekerUser.id,
      subject: "How to download feedback PDF",
      description: "I completed two mock sessions but cannot find a button to download the review report as a PDF.",
      status: "open",
      priority: "medium",
      createdAt: new Date(),
    }).returning();

    await db.insert(schema.ticketMessages).values([
      { ticketId: ticket2.id, senderId: seekerUser.id, message: "Where is the download feedback button? I need it to print out the report.", createdAt: new Date() }
    ]);

    // Interviewer Ticket 3 (In Progress)
    const [ticket3] = await db.insert(schema.supportTickets).values({
      userId: interviewerUser.id,
      subject: "Monthly payout details",
      description: "My payout status for June is still pending. Can you verify my banking details?",
      status: "in_progress",
      priority: "medium",
      createdAt: oneDayAgo,
    }).returning();

    await db.insert(schema.ticketMessages).values([
      { ticketId: ticket3.id, senderId: interviewerUser.id, message: "When will the June payout be released? Bank account is Commercial Bank.", createdAt: oneDayAgo },
      { ticketId: ticket3.id, senderId: adminUser.id, message: "Hello Supuni! All pending payouts are currently being audited by our finance department. It will be released in 24 hours.", createdAt: new Date() }
    ]);

    console.log("Presentation data seeded successfully!");
  } catch (error) {
    console.error("Error seeding presentation data:", error);
  } finally {
    process.exit(0);
  }
}

main();
