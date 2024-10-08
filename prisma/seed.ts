import { faker } from '@faker-js/faker'
import {
  AlevelQualification,
  Application,
  DegreeCode,
  FeeStatus,
  GCSEQualification,
  Gender,
  NextAction,
  PrismaClient,
  Role,
  User
} from '@prisma/client'

const prisma = new PrismaClient()

const createUser = (
  role: Role,
  login: string = faker.string.alpha({ length: 2 }).toLowerCase() +
    faker.string.numeric({ length: 3 }),
  admissionsCycle: number = faker.date.future().getFullYear()
) => {
  return {
    admissionsCycle: admissionsCycle,
    login: login,
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
    dateOfBirth: faker.date.birthdate(),
    email: faker.internet.email(),
    primaryNationality: faker.location.country()
  }
}

const createApplication = (reviewer: User) => {
  const paper1Score = faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 })
  const paper2Score = faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 })
  return {
    applicant: { create: createApplicant() },
    admissionsCycle: faker.date.future().getFullYear(),
    applicationDate: faker.date.past(),
    wideningParticipation: faker.datatype.boolean(),
    hasDisability: faker.datatype.boolean(),
    feeStatus: faker.helpers.arrayElement(Object.keys(FeeStatus)) as FeeStatus,
    nextAction: faker.helpers.arrayElement(Object.keys(NextAction)) as NextAction,
    tmuaPaper1Score: paper1Score,
    tmuaPaper2Score: paper2Score,
    tmuaOverallScore: (paper1Score + paper2Score) / 2,
    gcseQualification: faker.helpers.arrayElement(
      Object.keys(GCSEQualification)
    ) as GCSEQualification,
    gcseQualificationScore: faker.number.float({ multipleOf: 0.1, min: 0.0, max: 10.0 }),
    aLevelQualification: faker.helpers.arrayElement(
      Object.keys(AlevelQualification)
    ) as AlevelQualification,
    aLevelQualificationScore: faker.number.float({ multipleOf: 0.1, min: 0.0, max: 10.0 }),
    extenuatingCircumstances: faker.lorem.text(),
    academicEligibilityNotes: faker.lorem.text(),
    reviewer: {
      connect: {
        id: reviewer.id
      }
    }
  }
}

const createReview = (application: Application) => {
  return {
    motivationAdminScore: faker.number.float({ multipleOf: 0.1, min: 0.0, max: 10.0 }),
    extracurricularAdminScore: faker.number.float({ multipleOf: 0.1, min: 0.0, max: 10.0 }),
    examComments: faker.person.bio(),
    application: {
      connect: {
        id: application.id
      }
    }
  }
}

const createOutcome = (application: Application) => {
  return {
    cid: application.applicantCid,
    admissionsCycle: application.admissionsCycle,
    degreeCode: faker.helpers.arrayElement(Object.keys(DegreeCode)) as DegreeCode
  }
}

async function main() {
  // create 10 reviewers with 20 applications each
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({ data: createUser(Role.REVIEWER) })

    for (let j = 0; j < 20; j++) {
      const application = await prisma.application.create({ data: createApplication(user) })
      await prisma.internalReview.create({ data: createReview(application) })
      await prisma.outcome.create({ data: createOutcome(application) })
    }
  }
  await prisma.user.create({
    data: createUser(Role.ADMIN, 'zaki.amin20@imperial.ac.uk', 2024)
  })
  await prisma.user.create({
    data: createUser(Role.UG_TUTOR, 'zaki.amin20@imperial.ac.uk', 2025)
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
