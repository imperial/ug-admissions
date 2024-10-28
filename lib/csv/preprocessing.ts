import { DataUploadEnum } from '@/lib/types'
import { CsvError, parse } from 'csv-parse/sync'
import DataFrame from 'dataframe-js'
import { parse as parseDate } from 'date-fns/parse'

const uploadTypeProcessFunctionMap = {
  [DataUploadEnum.APPLICATION]: processApplication,
  [DataUploadEnum.TMUA_SCORES]: processTMUAScores,
  [DataUploadEnum.ADMIN_SCORING]: processAdminScoring,
  [DataUploadEnum.USER_ROLES]: processUserRoles
}

/**
 * Parses a CSV and runs processing function according to the upload type
 * @param file - the CSV file to process
 * @param uploadType - the type of data being uploaded
 * @returns flag to indicate success with data if true and errorMessage if false
 */
export async function preprocessCsvData(
  file: File,
  uploadType: DataUploadEnum
): Promise<{ success: true; data: unknown[] } | { success: false; errorMessage: string }> {
  if (file.type !== 'text/csv') return { success: false, errorMessage: 'File must be a CSV' }
  const lines = await file.text()

  let objects: unknown[]
  try {
    objects = parse(lines, {
      columns: true,
      skip_empty_lines: true
    })
  } catch (e: any) {
    if (e instanceof CsvError) {
      return { success: false, errorMessage: `Error reading CSV: ${e.message}` }
    }
    return { success: false, errorMessage: 'Unexpected parsing error occurred.' }
  }

  try {
    objects = uploadTypeProcessFunctionMap[uploadType](objects)
  } catch (e: any) {
    console.error(`error in CSV preprocessing: ${e.message}`)
    return {
      success: false,
      errorMessage:
        'Failure processing CSV: check the correct upload type has been selected and that all columns are named properly'
    }
  }

  return { success: true, data: objects }
}

/**
 * Process the data from the College-given applicant CSV file.
 * Renames, transforms and select columns as appropriate.
 * @param objects
 * @returns an array of objects with nested applicant and application objects
 */
function processApplication(objects: unknown[]): unknown[] {
  let df = new DataFrame(objects)
  df = df.replace('', null)

  df = renameColumns(df, [
    ['College ID (Applicant) (Contact)', 'cid'],
    ['UCAS ID (Applicant) (Contact)', 'ucasNumber'],
    ['Programme code (Programme) (Programme)', 'degreeCode'],
    ['First name (Applicant) (Contact)', 'firstName'],
    ['Last name (Applicant) (Contact)', 'surname'],
    ['Nationality (Applicant) (Contact)', 'primaryNationality'],
    ['Primary email address (Applicant) (Contact)', 'email'],
    ['Gender (Applicant) (Contact)', 'gender'],
    ['Date of birth', 'dateOfBirth'],
    ['Preferred first name (Applicant) (Contact)', 'preferredName'],
    ['Entry term', 'entryYear'],
    ['Fee status', 'feeStatus'],
    ['WP flag', 'wideningParticipation'],
    ['Sent to department', 'applicationDate'],
    ['Extenuating circumstances notes', 'extenuatingCircumstances'],
    ['Academic eligibility notes', 'academicEligibilityNotes'],
    ['TMUA Score', 'tmuaScore']
  ])

  // copy the applicationDate column and transform it to admissionsCycle
  // @ts-ignore
  df = df.withColumn('admissionsCycle', (row: any) => {
    const sentDate = parseDate(row.get('applicationDate'), 'dd/MM/yyyy HH:mm', new Date())
    // Sep to Dec 2025 is 2526, Jan to Aug 2026 is 2526
    const currentYear = sentDate.getFullYear().toString().slice(-2)
    return sentDate.getMonth() >= 8
      ? currentYear + (sentDate.getFullYear() + 1).toString().slice(-2)
      : (sentDate.getFullYear() - 1).toString().slice(-2) + currentYear
  })

  // @ts-ignore
  df = df.withColumn('entryYear', (row: any) => {
    // format is 'Autumn 2025-2026' so extract '2526'
    const [year1, year2] = row.get('entryYear')?.split(' ').at(1)?.split('-')
    return year1.slice(-2) + year2.slice(-2)
  })

  df = df.withColumn(
    'degreeCode',
    // @ts-ignore
    (row: any) =>
      // format is G400.1 so remove the .1
      row.get('degreeCode')?.split('.').at(0)
  )

  // capitalise enums so they validate
  // @ts-ignore
  df = df.withColumn('gender', (row: any) => {
    const gender = row.get('gender')
    if (gender === 'Other gender not listed') return 'OTHER'
    return gender?.toUpperCase()
  })
  // @ts-ignore
  df = df.withColumn('wideningParticipation', (row: any) => {
    const wp = row.get('wideningParticipation')
    if (wp === 'Not calculated') return 'NOT_CALCULATED'
    return wp?.toUpperCase()
  })
  // @ts-ignore
  df = df.withColumn('feeStatus', (row: any) => row.get('feeStatus')?.toUpperCase())

  const applicantColumns = [
    'cid',
    'ucasNumber',
    'gender',
    'firstName',
    'surname',
    'preferredName',
    'dateOfBirth',
    'email',
    'primaryNationality'
  ]
  const applicantDf = df.select(...applicantColumns)
  const applicantObjects = applicantDf.toCollection()

  const applicationColumns = [
    'hasDisability',
    'admissionsCycle',
    'entryYear',
    'feeStatus',
    'wideningParticipation',
    'applicationDate',
    'tmuaScore',
    'extenuatingCircumstances',
    'academicEligibilityNotes'
  ]

  // filter in case columns are missing e.g. TMUA score
  const existingApplicationColumns = applicationColumns.filter((col) =>
    df.listColumns().includes(col)
  )
  const applicationDf = df.select(...existingApplicationColumns)
  const applicationObjects = applicationDf.toCollection()

  const outcomeColumns = ['degreeCode']
  const outcomeDf = df.select(...outcomeColumns)
  const outcomeObjects = outcomeDf.toCollection()

  // zip arrays together to create nested object for schema validation
  return applicantObjects.map((applicant: unknown, i: number) => ({
    applicant: applicant,
    application: applicationObjects[i],
    outcome: outcomeObjects[i]
  }))
}

function processTMUAScores(objects: unknown[]): unknown[] {
  let df = new DataFrame(objects)
  df = renameColumns(df, [
    ['CID', 'cid'],
    ['Admissions Cycle', 'admissionsCycle'],
    ['TMUA Score', 'tmuaScore']
  ])
  return df.toCollection()
}

function processAdminScoring(objects: unknown[]): unknown[] {
  let df = new DataFrame(objects)
  df = renameColumns(df, [
    ['CID', 'cid'],
    ['Admissions Cycle', 'admissionsCycle'],
    ['Age 16 Qualification Type', 'gcseQualification'],
    ['Age 16 Qualification Score', 'gcseQualificationScore'],
    ['Age 18 Qualification Type', 'aLevelQualification'],
    ['Age 18 Qualification Score', 'aLevelQualificationScore'],
    ['Motivation Score', 'motivationAdminScore'],
    ['Extracurricular Score', 'extracurricularAdminScore'],
    ['Exam Comments', 'examComments']
  ])
  return df.toCollection()
}

function processUserRoles(objects: unknown[]): unknown[] {
  let df = new DataFrame(objects)
  df = renameColumns(df, [
    ['Admissions Cycle', 'admissionsCycle'],
    ['Email', 'login'],
    ['Role', 'role']
  ])
  return df.toCollection()
}

function renameColumns(df: DataFrame, columnsToRename: [string, string][]): DataFrame {
  columnsToRename.forEach(([oldName, newName]) => {
    df = df.rename(oldName, newName)
  })
  return df
}
