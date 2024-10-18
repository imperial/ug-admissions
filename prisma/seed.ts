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
  User,
  WP
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

const createApplication = (cycle: number, reviewer: User) => {
  return {
    applicant: { create: createApplicant() },
    admissionsCycle: cycle,
    applicationDate: faker.date.past(),
    wideningParticipation: faker.helpers.arrayElement(Object.keys(WP)) as WP,
    feeStatus: faker.helpers.arrayElement(Object.keys(FeeStatus)) as FeeStatus,
    nextAction: faker.helpers.arrayElement(Object.keys(NextAction)) as NextAction,
    tmuaScore: faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 }),
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
    cid: application.cid,
    admissionsCycle: application.admissionsCycle,
    degreeCode: faker.helpers.arrayElement(Object.keys(DegreeCode)) as DegreeCode
  }
}

async function main() {
  // create 10 reviewers with 20 applications each
  const CYCLE = 2526
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({ data: createUser(Role.REVIEWER, undefined, CYCLE) })

    for (let j = 0; j < 20; j++) {
      const application = await prisma.application.create({ data: createApplication(CYCLE, user) })
      await prisma.internalReview.create({ data: createReview(application) })
      await prisma.outcome.create({ data: createOutcome(application) })
    }
  }
  await prisma.user.create({
    data: createUser(Role.UG_TUTOR, 'zaki.amin20@imperial.ac.uk', CYCLE)
  })
  // this reviewer will have no applications assigned
  await prisma.user.create({
    data: createUser(Role.REVIEWER, 'reviewer@imperial.ac.uk', CYCLE)
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
