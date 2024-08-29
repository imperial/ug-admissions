import { PrismaClient } from "@prisma/client";
import {$Enums, FeeStatus} from "@prisma/client";
import Gender = $Enums.Gender;

const prisma = new PrismaClient()

async function main() {
  await prisma.application.create({
    data: {
      applicant: {
        create: {
          cid: "0123456",
          ucasNumber: "uC4s3850",
          gender: Gender.MALE,
          firstName: "Luke",
          surname: "Skywalker",
          email: "luke@gmail.com",
          primaryNationality: "Tatooinian",
        }
      },
      admissionsCycle: 2024,
      applicationDate: new Date(),
      wideningParticipation: true,
      hasDisability: false,
      feeStatus: FeeStatus.HOME,
      tmuaPaper1Score: 7.6,
      tmuaPaper2Score: 8.2,
      tmuaOverallScore: 8
    }
  })
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })