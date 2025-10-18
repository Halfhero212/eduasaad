import { db } from "./db";
import { users, courseCategories, platformSettings } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create default course categories if they don't exist
    const categories = [
      { name: "Programming", description: "Software development, coding, and programming languages" },
      { name: "Mathematics", description: "Algebra, calculus, geometry, and mathematical concepts" },
      { name: "Science", description: "Physics, chemistry, biology, and scientific principles" },
      { name: "Languages", description: "Foreign languages and language learning" },
      { name: "Business", description: "Business management, marketing, and entrepreneurship" },
      { name: "Design", description: "Graphic design, UI/UX, and creative arts" },
    ];

    for (const category of categories) {
      const [existing] = await db.select().from(courseCategories).where(eq(courseCategories.name, category.name));
      
      if (!existing) {
        await db.insert(courseCategories).values(category);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    // Create superadmin user if doesn't exist
    const superadminEmail = "admin@eduplatform.com";
    const [existingSuperadmin] = await db.select().from(users).where(eq(users.email, superadminEmail));

    if (!existingSuperadmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        email: superadminEmail,
        password: hashedPassword,
        fullName: "Super Admin",
        role: "superadmin",
      });
      console.log(`✅ Created superadmin account`);
      console.log(`   Email: ${superadminEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   ⚠️  Please change this password in production!`);
    } else {
      console.log(`⏭️  Superadmin account already exists`);
    }

    // Set default WhatsApp number setting
    const whatsappKey = "whatsapp_number";
    const [existingSetting] = await db.select().from(platformSettings).where(eq(platformSettings.key, whatsappKey));

    if (!existingSetting) {
      await db.insert(platformSettings).values({
        key: whatsappKey,
        value: "9647801234567", // Default Iraqi phone number format
      });
      console.log(`✅ Set default WhatsApp number`);
    } else {
      console.log(`⏭️  WhatsApp number setting already exists`);
    }

    console.log("\n🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
