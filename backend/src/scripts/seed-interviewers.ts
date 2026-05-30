import { db } from "../config/database";
import { users, interviewers, jobSeekers, interviewSessions, interviewerReviews } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const INTERVIEWERS_DATA = [
  {
    email: "dilhan.perera@interviewace.com",
    firstName: "Dilhan",
    lastName: "Perera",
    currentCompany: "WSO2",
    jobTitle: "Lead Software Engineer",
    yearsExperience: 8,
    industryExpertise: ["Software Engineering", "System Design", "Java", "Cloud Architecture"],
    linkedinProfile: "https://linkedin.com/in/dilhan-perera-demo",
    hourlyRate: "3500.00",
    bio: "Lead Engineer at WSO2 specializing in enterprise integrations and middleware. Passionate about system design and microservices.",
    ratingAverage: "4.90",
    totalInterviews: 42,
    totalEarnings: "147000.00",
  },
  {
    email: "sanduni.j@interviewace.com",
    firstName: "Sanduni",
    lastName: "Jayasekara",
    currentCompany: "Sysco LABS",
    jobTitle: "Senior QA Automation Engineer",
    yearsExperience: 6,
    industryExpertise: ["Quality Assurance", "Test Automation", "Selenium", "CI/CD"],
    linkedinProfile: "https://linkedin.com/in/sanduni-j-demo",
    hourlyRate: "2500.00",
    bio: "Senior QA Automation Engineer at Sysco LABS. I love helping candidates master test automation frameworks and QA methodologies.",
    ratingAverage: "4.80",
    totalInterviews: 28,
    totalEarnings: "70000.00",
  },
  {
    email: "minodh.desilva@interviewace.com",
    firstName: "Minodh",
    lastName: "de Silva",
    currentCompany: "LSEG",
    jobTitle: "Product Manager",
    yearsExperience: 7,
    industryExpertise: ["Product Management", "Agile", "Business Analysis", "Scrum"],
    linkedinProfile: "https://linkedin.com/in/minodh-desilva-demo",
    hourlyRate: "4000.00",
    bio: "Product Manager at London Stock Exchange Group. Experienced in product strategy, agile workflows, and case-study interview prep.",
    ratingAverage: "4.70",
    totalInterviews: 15,
    totalEarnings: "60000.00",
  },
  {
    email: "fathima.rizna@interviewace.com",
    firstName: "Fathima",
    lastName: "Rizna",
    currentCompany: "IFS",
    jobTitle: "Senior UI/UX Designer",
    yearsExperience: 5,
    industryExpertise: ["UI/UX Design", "Product Design", "Figma", "User Research"],
    linkedinProfile: "https://linkedin.com/in/fathima-rizna-demo",
    hourlyRate: "3000.00",
    bio: "Senior UI/UX Designer at IFS. Helping designers structure their portfolio presentations, walk through case studies, and pass whiteboard design challenges.",
    ratingAverage: "4.90",
    totalInterviews: 19,
    totalEarnings: "57000.00",
  },
  {
    email: "akila.w@interviewace.com",
    firstName: "Akila",
    lastName: "Wijesinghe",
    currentCompany: "Virtusa",
    jobTitle: "Solutions Architect",
    yearsExperience: 12,
    industryExpertise: ["System Design", "AWS", "Solutions Architecture", "DevOps"],
    linkedinProfile: "https://linkedin.com/in/akila-w-demo",
    hourlyRate: "5000.00",
    bio: "Solutions Architect with over 12 years of industry experience. Specializes in building highly scalable, distributed cloud architectures.",
    ratingAverage: "5.00",
    totalInterviews: 56,
    totalEarnings: "280000.00",
  },
  {
    email: "nuwan.s@interviewace.com",
    firstName: "Nuwan",
    lastName: "Senanayake",
    currentCompany: "Pearson",
    jobTitle: "Senior Frontend Engineer",
    yearsExperience: 6,
    industryExpertise: ["Frontend Engineering", "React", "Next.js", "Javascript"],
    linkedinProfile: "https://linkedin.com/in/nuwan-s-demo",
    hourlyRate: "3000.00",
    bio: "Senior Frontend Developer at Pearson. Expert in React ecosystems, Web Performance, and vanilla JavaScript coding assessments.",
    ratingAverage: "4.80",
    totalInterviews: 33,
    totalEarnings: "99000.00",
  },
];

const JOB_SEEKERS_DATA = [
  {
    email: "kasun.p@example.com",
    firstName: "Kasun",
    lastName: "Perera",
    university: "University of Moratuwa",
    graduationYear: 2025,
    fieldOfStudy: "Computer Science & Engineering",
  },
  {
    email: "thilini.f@example.com",
    firstName: "Thilini",
    lastName: "Fernando",
    university: "University of Colombo School of Computing",
    graduationYear: 2025,
    fieldOfStudy: "Information Systems",
  },
  {
    email: "ravindu.s@example.com",
    firstName: "Ravindu",
    lastName: "Silva",
    university: "Sri Lanka Institute of Information Technology",
    graduationYear: 2024,
    fieldOfStudy: "Software Engineering",
  },
];

const TESTIMONIALS_TEXT = [
  "Dilhan's system design mock session was incredibly detailed. His feedback on scaling databases helped me clear my actual interview at WSO2!",
  "Sanduni conducted a very realistic QA Automation session. Her advice on structuring test scripts in Selenium was exactly what I needed.",
  "Akila's Solutions Architect mock was a masterclass in distributed systems. He pushed me on scalability choices, which gave me immense confidence.",
];

async function seed() {
  console.log("🌱 Checking database for verified interviewers...");
  
  const existingVerified = await db
    .select()
    .from(interviewers)
    .where(eq(interviewers.isVerified, true));

  if (existingVerified.length >= 6) {
    console.log(`ℹ️  Already have ${existingVerified.length} verified interviewers in the database. Seeding skipped.`);
    return;
  }

  console.log("🌱 Seeding realistic verified interviewers...");
  const passwordHash = await bcrypt.hash("password123", 12);

  const seededInterviewers: any[] = [];
  for (const iv of INTERVIEWERS_DATA) {
    // 1. Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, iv.email));

    let userId: number;

    if (existingUser) {
      userId = existingUser.id;
      // Ensure verified in users
      await db.update(users).set({ isVerified: true, userType: "interviewer" }).where(eq(users.id, userId));
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email: iv.email,
          passwordHash,
          firstName: iv.firstName,
          lastName: iv.lastName,
          userType: "interviewer",
          isVerified: true,
          isActive: true,
        })
        .returning();
      userId = newUser.id;
    }

    // 2. Check if interviewer profile exists
    const [existingIvProfile] = await db
      .select()
      .from(interviewers)
      .where(eq(interviewers.userId, userId));

    let interviewerId: number;

    if (existingIvProfile) {
      interviewerId = existingIvProfile.id;
      // Update existing profile to match verified seeding specs
      await db
        .update(interviewers)
        .set({
          isVerified: true,
          verificationStatus: "approved",
          currentCompany: iv.currentCompany,
          jobTitle: iv.jobTitle,
          yearsExperience: iv.yearsExperience,
          industryExpertise: JSON.stringify(iv.industryExpertise),
          hourlyRate: iv.hourlyRate,
          bio: iv.bio,
          ratingAverage: iv.ratingAverage,
          totalInterviews: iv.totalInterviews,
          totalEarnings: iv.totalEarnings,
        })
        .where(eq(interviewers.id, interviewerId));
    } else {
      const [newIvProfile] = await db
        .insert(interviewers)
        .values({
          userId,
          currentCompany: iv.currentCompany,
          jobTitle: iv.jobTitle,
          yearsExperience: iv.yearsExperience,
          industryExpertise: JSON.stringify(iv.industryExpertise),
          linkedinProfile: iv.linkedinProfile,
          hourlyRate: iv.hourlyRate,
          bio: iv.bio,
          isVerified: true,
          verificationStatus: "approved",
          ratingAverage: iv.ratingAverage,
          totalInterviews: iv.totalInterviews,
          totalEarnings: iv.totalEarnings,
        })
        .returning();
      interviewerId = newIvProfile.id;
    }

    seededInterviewers.push({ id: interviewerId, name: `${iv.firstName} ${iv.lastName}` });
  }

  console.log(`✅ Seeded/verified ${seededInterviewers.length} interviewers successfully.`);

  // Seed Job Seekers for Testimonials if they don't exist
  console.log("🌱 Seeding job seekers for testimonials...");
  const seededJobSeekers: any[] = [];
  for (const js of JOB_SEEKERS_DATA) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, js.email));

    let userId: number;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email: js.email,
          passwordHash,
          firstName: js.firstName,
          lastName: js.lastName,
          userType: "job_seeker",
          isVerified: true,
          isActive: true,
        })
        .returning();
      userId = newUser.id;
    }

    const [existingJsProfile] = await db
      .select()
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, userId));

    let jobSeekerId: number;
    if (existingJsProfile) {
      jobSeekerId = existingJsProfile.id;
    } else {
      const [newJsProfile] = await db
        .insert(jobSeekers)
        .values({
          userId,
          university: js.university,
          graduationYear: js.graduationYear,
          fieldOfStudy: js.fieldOfStudy,
        })
        .returning();
      jobSeekerId = newJsProfile.id;
    }
    seededJobSeekers.push(jobSeekerId);
  }

  // Seed Completed Sessions & Testimonials (Reviews)
  console.log("🌱 Seeding sessions and testimonials...");
  // Create reviews for:
  // - Dilhan Perera (index 0) reviewed by Kasun Perera (index 0)
  // - Sanduni Jayasekara (index 1) reviewed by Thilini Fernando (index 1)
  // - Akila Wijesinghe (index 4) reviewed by Ravindu Silva (index 2)
  const targets = [
    { ivIndex: 0, jsIndex: 0, text: TESTIMONIALS_TEXT[0] },
    { ivIndex: 1, jsIndex: 1, text: TESTIMONIALS_TEXT[1] },
    { ivIndex: 4, jsIndex: 2, text: TESTIMONIALS_TEXT[2] },
  ];

  for (const target of targets) {
    const iv = seededInterviewers[target.ivIndex];
    const jsId = seededJobSeekers[target.jsIndex];

    if (!iv) continue;

    // Check if session already exists for this pair to avoid duplicates
    const existingSession = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.interviewerId, iv.id))
      .limit(1);

    let sessionId: number;

    if (existingSession.length > 0) {
      sessionId = existingSession[0].id;
    } else {
      const [newSession] = await db
        .insert(interviewSessions)
        .values({
          jobSeekerId: jsId,
          interviewerId: iv.id,
          sessionType: "technical",
          scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          duration: 60,
          sessionStatus: "completed",
          priceAmount: "3000.00",
        })
        .returning();
      sessionId = newSession.id;
    }

    // Add review
    const existingReview = await db
      .select()
      .from(interviewerReviews)
      .where(eq(interviewerReviews.sessionId, sessionId))
      .limit(1);

    if (existingReview.length === 0) {
      await db.insert(interviewerReviews).values({
        sessionId,
        jobSeekerId: jsId,
        interviewerId: iv.id,
        rating: 5,
        reviewText: target.text,
        isKnowledgeable: true,
        isHelpful: true,
        isActionable: true,
        isProfessional: true,
      });
      console.log(`✅ Seeded testimonial review for interviewer: ${iv.name}`);
    }
  }

  console.log("🎉 Seeding verified interviewers and testimonials complete!");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
