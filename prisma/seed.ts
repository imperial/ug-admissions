import { faker } from '@faker-js/faker'
import { Application, PrismaClient, Role, User } from '@prisma/client'
import { FeeStatus, Gender, NextAction } from '@prisma/client'

const prisma = new PrismaClient()

const createUser = (role: Role) => {
  return {
    admissionsCycle: faker.date.future().getFullYear(),
    loginId: faker.string.alpha({ length: 2 }).toLowerCase() + faker.string.numeric({ length: 3 }),
    role: role
  }
}

const createApplicant = () => {
  return {
    cid: faker.string.numeric({ length: 8 }),
    ucasNumber: faker.string.numeric({ length: 10 }),
    gender: faker.helpers.arrayElement(Object.keys(Gender)) as Gender,
    firstName: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    primaryNationality: faker.location.country()
  }
}

const createApplication = (reviewer: User) => {
  return {
    applicant: { create: createApplicant() },
    admissionsCycle: faker.date.future().getFullYear(),
    applicationDate: faker.date.past(),
    wideningParticipation: faker.datatype.boolean(),
    hasDisability: faker.datatype.boolean(),
    feeStatus: faker.helpers.arrayElement(Object.keys(FeeStatus)) as FeeStatus,
    nextAction: faker.helpers.arrayElement(Object.keys(NextAction)) as NextAction,
    tmuaPaper1Score: faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 }),
    tmuaPaper2Score: faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 }),
    tmuaOverallScore: faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 }),
    reviewer: {
      connect: {
        id: reviewer.id
      }
    }
  }
}

async function main() {
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({ data: createUser(Role.REVIEWER) })

    for (let j = 0; j < 10; j++) {
      await prisma.application.create({ data: createApplication(user) })
    }
  }
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
