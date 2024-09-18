import { faker } from '@faker-js/faker'
import DataFrame from 'dataframe-js'
import { format } from 'date-fns'

const createApplicantRow = (admissionCycle: number) => {
  return {
    'Entry term': `Autumn ${admissionCycle}-${admissionCycle + 1}`,
    'College ID (Applicant) (Contact)': faker.string.numeric(8),
    'UCAS ID (Applicant) (Contact)': faker.string.numeric(10),
    'First name (Applicant) (Contact)': faker.person.firstName(),
    'Last name (Applicant) (Contact)': faker.person.lastName(),
    'Nationality (Applicant) (Contact)': faker.location.country(),
    'Programme code (Programme) (Programme)': faker.helpers.arrayElement([
      'G400',
      'G401',
      'GG41',
      'GG14'
    ]),
    Programme: faker.helpers.arrayElement([
      'Computing BEng',
      'Computin MEng',
      'Joint Maths and Computing BEng',
      'Joint Maths and Computing MEng'
    ]),
    'Academic level': 'Undegraduate',
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
    'In Care,In care duration': faker.lorem.words(1),
    'Disability flag': faker.datatype.boolean() ? 'True' : 'False',
    otherNationality: faker.helpers.arrayElement([null, faker.location.country()])
  }
}

let rows: any[] = []
for (let i = 0; i < 6000; i++) {
  rows.push(createApplicantRow(2024))
}

const df = new DataFrame(rows)

// absolute pathname to the desired save location
const pathname = '/my/absolute/path/dataframe.csv'
df.toCSV(true, pathname)
