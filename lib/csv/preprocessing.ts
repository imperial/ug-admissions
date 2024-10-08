import { DataUploadEnum } from '@/lib/types'
import { CsvError, parse } from 'csv-parse/sync'
import DataFrame from 'dataframe-js'

const uploadTypeProcessFunctionMap = {
  [DataUploadEnum.APPLICANT]: processApplicantData,
  [DataUploadEnum.TMUA_SCORES]: processTMUAData,
  [DataUploadEnum.ADMIN_ASSESSMENTS]: processAdminAssessmentData,
  [DataUploadEnum.USER_ROLES]: processUserData
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
function processApplicantData(objects: unknown[]): unknown[] {
  let df = new DataFrame(objects)
  df = df.replace('', null)

  const columnsToRename = [
    ['College ID (Applicant) (Contact)', 'cid'],
    ['UCAS ID (Applicant) (Contact)', 'ucasNumber'],
    ['Programme code (Programme) (Programme)', 'degreeCode'],
    ['First name (Applicant) (Contact)', 'firstName'],
    ['Last name (Applicant) (Contact)', 'surname'],
    ['Nationality (Applicant) (Contact)', 'primaryNationality'],
    ['Primary email address (Applicant) (Contact)', 'email'],
    ['Gender (Applicant) (Contact)', 'gender'],
    ['Date of birth (Applicant) (Contact)', 'dateOfBirth'],
    ['Preferred first name', 'preferredName'],
    ['Disability flag', 'hasDisability'], // TODO, we do not have a column in the CSV for this as of now
    ['Entry term', 'admissionsCycle'],
    ['Fee status', 'feeStatus'],
    ['WP flag', 'wideningParticipation'],
    ['Sent to department', 'applicationDate'],
    ['Extenuating circumstances notes', 'extenuatingCircumstances'],
    ['Academic eligibility notes', 'academicEligibilityNotes'],
    ['TMUA Paper 1 Score', 'tmuaPaper1Score'],
    ['TMUA Paper 2 Score', 'tmuaPaper2Score'],
    ['TMUA Overall Score', 'tmuaOverallScore']
  ]
  columnsToRename.forEach(([oldName, newName]) => {
    df = df.rename(oldName, newName)
  })

  // transform admissionsCycle column to a number
  // ts-ignore is used because the type of DataFrame.withColumn() does not match the docs or implementation
  df = df.withColumn(
    'admissionsCycle',
    // @ts-ignore
    (row: any) =>
      // format is 'Autumn 2024-2025' so extract 2024
      row.get('admissionsCycle')?.split(' ').at(1)?.split('-')[0]
  )

  df = df.withColumn(
    'degreeCode',
    // @ts-ignore
    (row: any) =>
      // format is G400.1 so remove the .1
      row.get('degreeCode')?.split('.').at(0)
  )

  // capitalise enums so they validate
  // @ts-ignore
  df = df.withColumn('gender', (row: any) => row.get('gender')?.toUpperCase())
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
    'primaryNationality',
    'otherNationality'
  ]
  const applicantDf = df.select(...applicantColumns)
  const applicantObjects = applicantDf.toCollection()

  const applicationColumns = [
    'hasDisability',
    'admissionsCycle',
    'feeStatus',
    'wideningParticipation',
    'applicationDate',
    'tmuaPaper1Score',
    'tmuaPaper2Score',
    'tmuaOverallScore',
    'extenuatingCircumstances',
    'academicEligibilityNotes'
  ]

  // filter in case the TMUA columns don't exist
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

function processTMUAData(objects: unknown[]): unknown[] {
  return objects
}

function processAdminAssessmentData(objects: unknown[]): unknown[] {
  return objects
}

function processUserData(objects: unknown[]): unknown[] {
  return objects
}
