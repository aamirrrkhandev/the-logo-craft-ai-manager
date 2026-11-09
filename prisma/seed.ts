import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.website.upsert({
    where: { baseUrl: "https://thelogocraft.com" },
    update: {},
    create: {
      name: "The Logo Craft",
      baseUrl: "https://thelogocraft.com",
      platform: "Lovable + WordPress REST API"
    }
  });
  console.log("Seeded The Logo Craft website.");
}
main().finally(() => prisma.$disconnect());
