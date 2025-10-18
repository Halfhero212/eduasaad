import cron from "node-cron";
import { cleanupOldQuizImages } from "./cleanup-quiz-images";

export function startCronJobs() {
  // Run cleanup every day at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("\n📅 Running scheduled quiz image cleanup...");
    try {
      await cleanupOldQuizImages();
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });

  console.log("✅ Cron jobs started (daily cleanup at 2 AM)");
}
