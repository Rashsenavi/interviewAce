import { createMockTicket, addTicketMessage } from "./src/services/support.service";
import { db } from "./src/config/database";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

(async () => {
  try {
    const allUsers = await db.select().from(users).limit(5);
    const adminUser = allUsers.find(u => u.userType === "admin") || allUsers[0];
    const normalUsers = allUsers.filter(u => u.userType !== "admin");

    if (normalUsers.length > 0) {
      const ticket1 = await createMockTicket(normalUsers[0].id, "Cannot access my scheduled interview", "I tried to click the Zoom link but it says invalid meeting ID. My interview is in 10 minutes!");
      await addTicketMessage(ticket1.id, adminUser.id, "Hi there, I have reset the meeting link. Please refresh your page and try again.");
      
      const ticket2 = await createMockTicket(normalUsers[0].id, "Payment failed", "I tried to purchase a package but my card was declined even though I have sufficient funds.");
      
      if (normalUsers.length > 1) {
        const ticket3 = await createMockTicket(normalUsers[1].id, "How do I become an interviewer?", "I have 5 years of experience in Software Engineering and would like to mentor others.");
        await addTicketMessage(ticket3.id, adminUser.id, "Hello! You can register as an interviewer from the homepage by clicking 'Become a Mentor'. You'll need to submit your LinkedIn profile for verification.");
        await addTicketMessage(ticket3.id, normalUsers[1].id, "Thanks! I just submitted my application.");
      }
      console.log("Mock tickets created successfully!");
    } else {
      console.log("No users found to create tickets for.");
    }
  } catch (error) {
    console.error("Error creating mock tickets:", error);
  }
  process.exit(0);
})();
