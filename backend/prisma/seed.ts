import { PrismaClient } from "@prisma/client"
import { auth } from "../src/lib/auth" // 👈 adjust path

const prisma = new PrismaClient()

async function main() {
  const email = "admin@housiee.com"
  const password = "12345678"

  // Clean slate
  await prisma.user.deleteMany({ where: { email } })

  // ✅ Let Better Auth handle EVERYTHING
  const user = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: "Admin",
    },
  })

  // Add role manually (Better Auth doesn’t manage roles)
  await prisma.user.update({
    where: { id: user.user.id },
    data: {
      role: "ADMIN",
      emailVerified: true,
    },
  })

  console.log("✅ Admin user created via Better Auth:", user.user)
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect())
