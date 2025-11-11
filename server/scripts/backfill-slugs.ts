import { db } from "../db";
import { courses } from "@shared/schema";
import { generateSlug } from "../utils/slug";
import { eq } from "drizzle-orm";

async function backfillSlugs() {
  console.log("Starting slug backfill...");
  
  // Get all courses
  const allCourses = await db.select().from(courses);
  
  console.log(`Found ${allCourses.length} courses to update`);
  
  for (const course of allCourses) {
    const slug = generateSlug(course.title, course.id);
    console.log(`Course ${course.id}: "${course.title}" -> "${slug}"`);
    
    await db.update(courses)
      .set({ slug })
      .where(eq(courses.id, course.id));
  }
  
  console.log("Slug backfill completed!");
  process.exit(0);
}

backfillSlugs().catch((error) => {
  console.error("Error during backfill:", error);
  process.exit(1);
});
