import { DataUploadEnum } from '@/lib/types'
import { CsvError, parse } from 'csv-parse/sync'
import DataFrame from 'dataframe-js'

const uploadTypeProcessFunctionMap = {
  [DataUploadEnum.APPLICANT]: processApplicantData,
  [DataUploadEnum.TMUA_SCORES]: processTMUAData,
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
  if (file.name.split('.').pop() !== 'csv')
    return { success: false, errorMessage: 'File must be a CSV' }
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

  objects = uploadTypeProcessFunctionMap[uploadType](objects)

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
    ['Sent to department', 'applicationDate']
  ]
  columnsToRename.forEach(([oldName, newName]) => {
    df = df.rename(oldName, newName)
  })

  // transform admissionsCycle column to a number
  // ts-ignore is used because the types do not match the documentation or implementation
  df = df.withColumn(
    'admissionsCycle',
    // @ts-ignore
    (row: any) =>
      // format is 'Autumn 2024-2025' so extract 2024
      row.get('admissionsCycle')?.split(' ').at(1)?.split('-')[0]
  )
  // capitalise enums so they validate
  // @ts-ignore
  df = df.withColumn('gender', (row: any) => row.get('gender')?.toUpperCase())
  // @ts-ignore
  df = df.withColumn('feeStatus', (row: any) => row.get('feeStatus')?.toUpperCase())

  // outcomes table does not exist yet, should create an outcome for each application
  // const outcomeColumnsToRename = {
  //   'Programme code (Programme) (Programme)', 'degreeCode'
  // }

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
    'applicationDate'
  ]
  const applicationDf = df.select(...applicationColumns)
  const applicationObjects = applicationDf.toCollection()

  // zip arrays together to create nested object for schema validation
  return applicantObjects.map((applicant: unknown, i: number) => ({
    applicant: applicant,
    application: applicationObjects[i]
  }))
}

function processTMUAData(objects: unknown[]): unknown[] {
  return objects
}

function processUserData(objects: unknown[]): unknown[] {
  return objects
}
