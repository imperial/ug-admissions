import { PrismaClient } from "@prisma/client";
import {FeeStatus, Gender} from "@prisma/client";
import { faker } from '@faker-js/faker'
import {FeeStatus, Gender} from "@prisma/client";
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const createApplicant = () => {
  return {
    cid: faker.string.numeric({length: 8}),
    ucasNumber: faker.string.numeric({length: 10}),
    gender: faker.helpers.arrayElement(Object.keys(Gender)) as Gender,
    firstName: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    primaryNationality: faker.location.country(),
  }
}

const createApplication = () => {
  return {
      applicant: {create: createApplicant()},
      admissionsCycle: faker.date.future().getFullYear(),
      applicationDate: faker.date.past(),
      wideningParticipation: faker.datatype.boolean(),
      hasDisability: faker.datatype.boolean(),
      feeStatus: faker.helpers.arrayElement(Object.keys(FeeStatus)) as FeeStatus,
      tmuaPaper1Score: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
      tmuaPaper2Score: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
      tmuaOverallScore: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
  }
}

const createApplicant = () => {
  return {
    cid: faker.string.numeric({length: 8}),
    ucasNumber: faker.string.numeric({length: 10}),
    gender: faker.helpers.arrayElement(Object.keys(Gender)) as Gender,
    firstName: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    primaryNationality: faker.location.country(),
  }
}

const createApplication = () => {
  return {
      applicant: {create: createApplicant()},
      admissionsCycle: faker.date.future().getFullYear(),
      applicationDate: faker.date.past(),
      wideningParticipation: faker.datatype.boolean(),
      hasDisability: faker.datatype.boolean(),
      feeStatus: faker.helpers.arrayElement(Object.keys(FeeStatus)) as FeeStatus,
      tmuaPaper1Score: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
      tmuaPaper2Score: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
      tmuaOverallScore: faker.number.float({multipleOf: 0.1, min: 1.0, max: 9.0}),
  }
}

async function main() {
  for (let i = 0; i < 30; i++) {
    await prisma.application.create({
      data: createApplication()
    })
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
  