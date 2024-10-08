import { faker } from '@faker-js/faker'
import { AlevelQualification, GCSEQualification } from '@prisma/client'
import DataFrame from 'dataframe-js'

const createAdminAssessments = (cid: string, cycle: number) => {
  const adminObject = {
    cid: cid,
    admissionsCycle: cycle,
    gcseQualification: faker.helpers.arrayElement(Object.values(GCSEQualification)),
    gcseQualificationScore: faker.number.float({ min: 0, max: 10, precision: 1 }),
    aLevelQualification: faker.helpers.arrayElement(Object.values(AlevelQualification)),
    aLevelQualificationScore: faker.number.float({ min: 0, max: 10, precision: 1 }),
    motivationAssessments: faker.number.float({ min: 0, max: 10, precision: 1 }),
    extracurricularAssessments: faker.number.float({ min: 0, max: 10, precision: 1 }),
    examComments: faker.hacker.phrase()
  }
  const df = new DataFrame([adminObject])
  df.toCSV(true, 'generated-admin-assessments.csv')
}

createAdminAssessments('12345678', 2024)
