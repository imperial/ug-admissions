import { faker } from '@faker-js/faker'
import DataFrame from 'dataframe-js'
import { format } from 'date-fns'
import _ from 'lodash'

const applicantNoTmua = (admissionCycle: number) => {
  return {
    'Entry term': `Autumn ${admissionCycle}-${admissionCycle + 1}`,
    'College ID (Applicant) (Contact)': faker.string.numeric(8),
    'UCAS ID (Applicant) (Contact)': faker.string.numeric(10),
    'First name (Applicant) (Contact)': faker.person.firstName(),
    'Last name (Applicant) (Contact)': faker.person.lastName(),
    'Nationality (Applicant) (Contact)': faker.location.country(),
    'Programme code (Programme) (Programme)': faker.helpers.arrayElement([
      'G400.1',
      'G401.1',
      'GG41.1',
      'GG14.1'
    ]),
    Programme: faker.helpers.arrayElement([
      'Computing (BEng 3YFT)',
      'Computing (MEng 3YFT)',
      'Joint Mathematics and Computing (BEng 3YFT)',
      'Joint Mathematics and Computing (MEng 3YFT)'
    ]),
    'Academic level': 'Undergraduate',
    'Primary email address (Applicant) (Contact)': faker.internet.email(),
    'Minors flag': faker.helpers.arrayElement(['Over 18', 'Under 18']),
    'Fee status': faker.helpers.arrayElement(['UNKNOWN', 'OVERSEAS', 'HOME', null]),
    'WP flag': faker.helpers.arrayElement(['True', 'False']),
    'On hold reason': null,
    'Second choice': faker.datatype.boolean(),
    'Gender (Applicant) (Contact)': faker.helpers.arrayElement(['Male', 'Female', 'Other']),
    'Date of birth (Applicant) (Contact)': format(faker.date.past(), 'dd/MM/y'),
    'Sent to department': format(faker.date.past(), 'dd/MM/y HH:mm'),
    'Academic eligibility notes': faker.hacker.adjective(),
    'Extenuating circumstances': faker.datatype.boolean() ? 'Yes' : 'No',
    'Extenuating circumstances notes': faker.hacker.phrase(),
    'Preferred first name': faker.person.firstName(),
    'In Care': faker.datatype.boolean() ? 'Yes' : 'No',
    'In care duration': faker.lorem.words(1),
    'Disability flag': faker.datatype.boolean() ? 'True' : 'False',
    otherNationality: faker.helpers.arrayElement([null, faker.location.country()])
  }
}

const applicantWithTmua = (admissionCycle: number) => {
  const applicant = applicantNoTmua(admissionCycle)
  const paper1Score = faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 })
  const paper2Score = faker.number.float({ multipleOf: 0.1, min: 1.0, max: 9.0 })
  const overallScore = _.round((paper1Score + paper2Score) / 2, 1)
  return {
    ...applicant,
    'TMUA Paper 1 Score': paper1Score,
    'TMUA Paper 2 Score': paper2Score,
    'TMUA Overall Score': overallScore
  }
}

const createApplicants = (cycle: number, quantity: number, withTmua: boolean) => {
  const rows: any[] = _.times(quantity, () =>
    withTmua ? applicantWithTmua(cycle) : applicantNoTmua(cycle)
  )
  const df = new DataFrame(rows)
  df.toCSV(true, `generated-applicants-${withTmua ? 'with-tmua' : 'no-tmua'}-${quantity}.csv`)
}

createApplicants(2024, 100, true)
