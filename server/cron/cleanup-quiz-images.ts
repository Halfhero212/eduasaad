import { Client } from "@replit/object-storage";
import { db } from "../db";
import { quizSubmissions } from "@shared/schema";
import { sql } from "drizzle-orm";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function cleanupOldQuizImages() {
  console.log("🧹 Starting cleanup of old quiz submission images...");

  try {
    const objectStorage = new Client();
    const oneWeekAgo = new Date(Date.now() - ONE_WEEK_MS);

    // Find all quiz submissions older than 1 week with images
    const oldSubmissions = await db
      .select()
      .from(quizSubmissions)
      .where(sql`${quizSubmissions.submittedAt} < ${oneWeekAgo} AND ${quizSubmissions.imageUrls} IS NOT NULL`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const submission of oldSubmissions) {
      if (!submission.imageUrls || submission.imageUrls.length === 0) {
        continue;
      }

      console.log(`Processing submission ${submission.id} with ${submission.imageUrls.length} images...`);

      for (const imageUrl of submission.imageUrls) {
        try {
          await objectStorage.delete(imageUrl);
          deletedCount++;
          console.log(`  ✓ Deleted: ${imageUrl}`);
        } catch (error) {
          errorCount++;
          console.error(`  ✗ Failed to delete ${imageUrl}:`, error);
        }
      }

      // Update submission to remove image URLs
      await db
        .update(quizSubmissions)
        .set({ imageUrls: null })
        .where(sql`${quizSubmissions.id} = ${submission.id}`);

      console.log(`  Updated submission ${submission.id} to remove image URLs`);
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Submissions processed: ${oldSubmissions.length}`);
    console.log(`   Images deleted: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupOldQuizImages()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
