/**
 * Seed script: Populate IT-focused question bank
 * Run: npx tsx --env-file=.env.local src/scripts/seed-questions.ts
 */
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  connect_timeout: 120,
  max: 1,
  prepare: false,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(client, { schema });

const IT_QUESTIONS = [
  // ---------- TECHNICAL - Software Engineering ----------
  {
    questionText: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "REST uses fixed endpoints and HTTP verbs for operations. GraphQL provides a single endpoint where clients specify exactly what data they need. Choose REST for simple, cacheable APIs; GraphQL for complex, multi-resource queries or when bandwidth is a concern (mobile apps).",
    tips: "Mention over-fetching/under-fetching problem that GraphQL solves. Show you understand tradeoffs.",
  },
  {
    questionText: "What is the difference between process and thread? How does your OS manage them?",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "A process is an independent program with its own memory space. A thread is a unit of execution within a process sharing the process's memory. OS uses scheduling algorithms (round-robin, priority-based) to allocate CPU time.",
    tips: "Mention context switching cost and why threads are lighter than processes.",
  },
  {
    questionText: "Explain SOLID principles with an example from your work.",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. E.g., SRP: A UserService handles only user data — email sending is a separate EmailService.",
    tips: "Pick 2-3 principles and give concrete code examples. Interviewers want practical understanding, not just definitions.",
  },
  {
    questionText: "How would you design a URL shortener like bit.ly? Walk me through your system design approach.",
    questionType: "technical",
    difficultyLevel: "hard",
    sampleAnswer: "Generate short unique codes (base62), store in DB with original URL. Use CDN + caching for high read throughput. Consider consistent hashing for distributed systems. Add analytics tracking asynchronously.",
    tips: "Clarify requirements first (read-heavy? analytics needed?). Discuss tradeoffs between approaches.",
  },
  {
    questionText: "What is a database index and when would you not use one?",
    questionType: "technical",
    difficultyLevel: "easy",
    sampleAnswer: "An index speeds up read queries by creating a sorted data structure on a column. Avoid indexes on small tables, columns with low cardinality, or tables with heavy write operations (indexes slow down inserts/updates).",
    tips: "Be specific about composite indexes and their column order importance.",
  },
  {
    questionText: "Explain the CAP theorem and how it applies to distributed systems you've worked with.",
    questionType: "technical",
    difficultyLevel: "hard",
    sampleAnswer: "CAP: Consistency, Availability, Partition Tolerance — you can guarantee only 2 of 3 in a distributed system. MongoDB prioritizes CP, Cassandra prioritizes AP. For financial systems, prefer CP; for social media, AP is acceptable.",
    tips: "Show real-world examples. Mention PACELC as a more nuanced model.",
  },
  {
    questionText: "What is the difference between synchronous and asynchronous programming? When should you use async/await vs callbacks vs promises?",
    questionType: "technical",
    difficultyLevel: "easy",
    sampleAnswer: "Sync: code executes sequentially. Async: non-blocking operations allow other code to run while waiting. Prefer async/await for readability. Promises chain operations. Callbacks are the oldest pattern but lead to callback hell.",
    tips: "Give a real example like file I/O or API calls. Mention event loop for Node.js.",
  },
  {
    questionText: "How does garbage collection work in Java or Python? What are common memory leak scenarios?",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "GC automatically frees memory for unreachable objects. Common leaks: holding references in static collections, unclosed resources, event listeners not removed. Java uses generational GC (Young/Old/Permanent gen).",
    tips: "Mention heap profiling tools (JProfiler, memory_profiler) you've used.",
  },
  // ---------- TECHNICAL - QA ----------
  {
    questionText: "What is the difference between regression testing, smoke testing, and sanity testing?",
    questionType: "technical",
    difficultyLevel: "easy",
    sampleAnswer: "Regression: re-testing existing functionality after changes. Smoke: quick high-level checks to verify build stability. Sanity: narrow testing to verify specific functionality after a bug fix.",
    tips: "Give examples of when each is appropriate in a sprint cycle.",
  },
  {
    questionText: "How would you design a test strategy for a new mobile banking application?",
    questionType: "technical",
    difficultyLevel: "hard",
    sampleAnswer: "Unit tests for business logic, integration tests for API contracts, UI automation (Appium/XCTest), performance testing for API response times (<200ms), security testing (OWASP), accessibility testing, cross-device testing matrix.",
    tips: "Mention risk-based testing — focus on financial transactions and security-critical paths first.",
  },
  {
    questionText: "Explain the test pyramid. Why is it important to have more unit tests than E2E tests?",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "Unit (many) > Integration (some) > E2E (few). Unit tests are fast, cheap, and isolated. E2E tests are slow, brittle, and expensive to maintain. Inverting the pyramid creates slow, flaky test suites.",
    tips: "Discuss specific numbers from your experience (e.g., 80% unit, 15% integration, 5% E2E).",
  },
  // ---------- TECHNICAL - DevOps ----------
  {
    questionText: "Explain the difference between CI and CD. How have you implemented these in a previous project?",
    questionType: "technical",
    difficultyLevel: "easy",
    sampleAnswer: "CI (Continuous Integration): automatically build and test code on every commit. CD (Continuous Delivery/Deployment): automatically deploy to staging/production. Used GitHub Actions + Docker + Kubernetes for automated deployment pipelines.",
    tips: "Be specific about tools (Jenkins, GitHub Actions, GitLab CI) and the problems they solved.",
  },
  {
    questionText: "What is Docker and how does it differ from a virtual machine?",
    questionType: "technical",
    difficultyLevel: "easy",
    sampleAnswer: "Docker containers share the host OS kernel — lightweight, fast startup. VMs emulate full hardware with a guest OS — heavier but stronger isolation. Containers are ideal for microservices; VMs for multi-tenant security boundaries.",
    tips: "Mention Dockerfile, docker-compose for multi-service setups.",
  },
  {
    questionText: "Describe a Kubernetes deployment strategy for a high-traffic application. How would you handle zero-downtime deployments?",
    questionType: "technical",
    difficultyLevel: "hard",
    sampleAnswer: "Rolling update strategy with maxSurge/maxUnavailable configured. Use readiness probes to ensure new pods are ready before traffic shifts. Blue-green deployment for instant rollback. HPA for auto-scaling under load.",
    tips: "Mention resource limits, namespaces, and how you've handled cluster failures.",
  },
  // ---------- BEHAVIORAL ----------
  {
    questionText: "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
    questionType: "behavioral",
    difficultyLevel: "medium",
    sampleAnswer: "Use STAR method: Situation (team conflict on tech choice), Task (needed consensus), Action (1:1 conversation, brought data to back decision), Result (team aligned and shipped on time).",
    tips: "Focus on what YOU did, not what the other person did wrong. Show empathy and professionalism.",
  },
  {
    questionText: "Describe a situation where you had to learn a new technology quickly under pressure. What was your approach?",
    questionType: "behavioral",
    difficultyLevel: "medium",
    sampleAnswer: "STAR: Production system migration to Kubernetes (Situation). Needed to learn K8s in 2 weeks (Task). Completed official K8s course, built a local cluster, paired with a senior DevOps (Action). Delivered migration on schedule (Result).",
    tips: "Emphasize your learning strategy, not just the outcome. Interviewers want to see how you handle unknowns.",
  },
  {
    questionText: "Tell me about a project you're most proud of. What was your contribution and what would you do differently?",
    questionType: "behavioral",
    difficultyLevel: "easy",
    sampleAnswer: "Choose a real project with clear impact. Describe your specific role (architect, lead developer, etc.), challenges overcome, and measurable outcome. For 'differently': show reflection — e.g., 'I'd do more upfront API design to avoid integration issues'.",
    tips: "Have 2-3 projects ready. Pick one with technical depth. Always have a genuine 'what I'd do differently' answer.",
  },
  {
    questionText: "Tell me about a time you failed. What did you learn from it?",
    questionType: "behavioral",
    difficultyLevel: "easy",
    sampleAnswer: "Be honest and specific. Describe the failure, your role in it, what happened as a result, and concrete steps you took to prevent it recurring. Growth mindset is more important than the failure itself.",
    tips: "Don't choose something trivial or blame others. Interviewers want to see self-awareness and maturity.",
  },
  {
    questionText: "Describe a time you had to prioritize multiple competing deadlines. How did you decide what to work on?",
    questionType: "behavioral",
    difficultyLevel: "medium",
    sampleAnswer: "Use impact vs effort matrix. Communicated transparently with stakeholders about realistic timelines. Delegated where possible. Delivered most critical features first (MVP approach).",
    tips: "Show you can negotiate scope and communicate proactively — not just 'work harder'.",
  },
  // ---------- SITUATIONAL ----------
  {
    questionText: "You discover a critical security vulnerability in production code on a Friday afternoon. Your team lead is unavailable. What do you do?",
    questionType: "situational",
    difficultyLevel: "hard",
    sampleAnswer: "Assess severity immediately. If exploitable: disable the vulnerable feature/endpoint, escalate to security team and CTO. Document the vulnerability. Draft a hotfix. Don't silently patch — transparency is essential.",
    tips: "Show you understand incident response protocols and when to escalate vs. handle independently.",
  },
  {
    questionText: "Your product manager wants to add a feature that you believe will create significant technical debt. How do you approach this conversation?",
    questionType: "situational",
    difficultyLevel: "medium",
    sampleAnswer: "Quantify the debt: 'This will add 3 weeks of future rework.' Propose alternatives or a phased approach. Use data from past similar decisions. Document the decision for future reference. Ultimately respect PM's decision but ensure risks are recorded.",
    tips: "Show you can advocate for technical quality while being a collaborative business partner.",
  },
  {
    questionText: "You're 3 days before a release and realize a key feature won't be ready. What do you do?",
    questionType: "situational",
    difficultyLevel: "hard",
    sampleAnswer: "Immediately inform stakeholders — no surprises. Assess options: scope reduction (ship MVP), feature flag (hide incomplete feature), or deadline extension. Recommend the option with least business impact. Document why and what will be delivered.",
    tips: "Early communication is key. 3 days before > 1 day before. Show risk management skills.",
  },
  // ---------- GENERAL / HR ----------
  {
    questionText: "Why do you want to work in IT? What motivates you to stay in this field?",
    questionType: "general",
    difficultyLevel: "easy",
    sampleAnswer: "Be authentic. Connect IT to problem-solving, continuous learning, and impact. Specific example: 'I built a tool that automated a 4-hour manual process — that direct impact motivates me daily.'",
    tips: "Generic answers like 'I like technology' won't stand out. Connect to a specific moment or impact.",
  },
  {
    questionText: "Where do you see yourself in 5 years?",
    questionType: "general",
    difficultyLevel: "easy",
    sampleAnswer: "Show ambition but align with company trajectory. E.g., 'I want to grow into a technical lead role, mentoring junior engineers while staying hands-on with architecture decisions. I'm particularly interested in distributed systems.'",
    tips: "Research the company's career ladder before answering. Avoid 'I want your job' or vague answers.",
  },
  {
    questionText: "How do you stay current with new technologies and industry trends?",
    questionType: "general",
    difficultyLevel: "easy",
    sampleAnswer: "Be specific: 'I read the AWS blog weekly, follow Martin Fowler and Dan Abramov on X, contribute to open source on weekends, and take one Coursera course per quarter. Recently completed the Kubernetes Administrator cert.'",
    tips: "Name specific blogs, books, communities. 'I Google things' is not an answer.",
  },
  {
    questionText: "What is your greatest weakness? How are you working to improve it?",
    questionType: "general",
    difficultyLevel: "medium",
    sampleAnswer: "Be honest but strategic. E.g., 'I tend to over-engineer solutions. I've been working on this by time-boxing design phases and getting early feedback before committing to architecture decisions.'",
    tips: "Choose a real weakness that isn't a core job requirement. Always show what you're actively doing about it.",
  },
];

async function seed() {
  console.log("🌱 Seeding IT question bank...");

  // Ensure IT industry exists
  let [itIndustry] = await db
    .select({ id: schema.industries.id })
    .from(schema.industries)
    .where(eq(schema.industries.industryName, "IT & Software"));

  if (!itIndustry) {
    [itIndustry] = await db
      .insert(schema.industries)
      .values({
        industryName: "IT & Software",
        description: "Information Technology, Software Engineering, and related fields",
        isActive: true,
        displayOrder: 1,
      })
      .returning({ id: schema.industries.id });
    console.log("✅ Created IT & Software industry");
  } else {
    console.log("✅ IT & Software industry already exists");
  }

  // Check existing questions
  const existing = await db
    .select({ id: schema.questionBank.id })
    .from(schema.questionBank)
    .where(eq(schema.questionBank.industryId, itIndustry.id));

  if (existing.length > 0) {
    console.log(`ℹ️  ${existing.length} IT questions already exist. Skipping seed.`);
    await client.end();
    process.exit(0);
  }

  // Insert questions
  for (const q of IT_QUESTIONS) {
    await db.insert(schema.questionBank).values({
      industryId: itIndustry.id,
      questionText: q.questionText,
      questionType: q.questionType,
      difficultyLevel: q.difficultyLevel,
      sampleAnswer: q.sampleAnswer,
      tips: q.tips,
      isApproved: true,
      isActive: true,
      usageCount: 0,
    });
  }

  console.log(`✅ Seeded ${IT_QUESTIONS.length} IT questions successfully!`);
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
