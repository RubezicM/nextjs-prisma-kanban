// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt-ts-edge";

const prisma = new PrismaClient();

const testUserData = {
  email: "test@test.com",
  password: "test123",
  name: "Test User",
};

async function main() {
  console.log("🌱 Starting database seed...");

  // Only run in development or when explicitly forced
  if (process.env.NODE_ENV === "production" && !process.env.FORCE_SEED) {
    console.log("⚠️  Skipping seed in production environment");
    console.log("💡 To force seed in production, set FORCE_SEED=true");
    return;
  }

  console.log("🔧 Creating test user for demo purposes...");

  try {
    // Check if test user already exists
    console.log("🔍 Checking if test user already exists...");
    const existingUser = await prisma.user.findUnique({
      where: { email: testUserData.email },
    });

    if (existingUser) {
      console.log("⚠️  Test user already exists! Skipping user creation...");
      console.log(`📧 Email: ${testUserData.email}`);
      console.log(`🆔 User ID: ${existingUser.id}`);
      return;
    }

    // Hash the password using the same method as the auth system
    console.log("🔐 Hashing password for security...");
    const hashedPassword = hashSync(testUserData.password, 10);
    console.log("✅ Password hashed successfully!");

    // Create the test user
    console.log("👤 Creating test user in database...");
    const testUser = await prisma.user.create({
      data: {
        email: testUserData.email,
        password: hashedPassword,
        name: testUserData.name,
      },
    });

    console.log("🎉 Test user created successfully!");
    console.log("📋 Test User Details:");
    console.log(`  📧 Email: ${testUser.email}`);
    console.log(`  👤 Name: ${testUser.name}`);
    console.log(`  🆔 ID: ${testUser.id}`);
    console.log(`  📅 Created: ${testUser.createdAt}`);
    console.log("");
    console.log("🔑 Login Credentials:");
    console.log(`  📧 Email: ${testUserData.email}`);
    console.log(`  🔒 Password: ${testUserData.password}`);
    console.log("");
    console.log("✨ You can now log in with these credentials!");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
