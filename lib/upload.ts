'use server'

import prisma from '@/db'
import { Role, type User } from '@prisma/client'
import { CsvError, parse } from 'csv-parse/sync'
import { z } from 'zod'

import { FormPassbackState } from './types'

const RoleEnum = z.nativeEnum(Role)

const userSchema = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: RoleEnum
})

export const insertUploadedData = async (
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const csv = formData.get('csv') as File
  if (csv.name.split('.').pop() !== 'csv') return { message: 'File must be a CSV', status: 'error' }

  const lines = await csv.text()
  let users: Omit<User, 'id'>[]
  try {
    users = parse(lines, {
      columns: true,
      skip_empty_lines: true
    })
  } catch (e: any) {
    if (e instanceof CsvError) {
      return { message: `Error reading CSV: ${e.message}`, status: 'error' }
    }
    return { message: 'Unexpected parsing error occurred.', status: 'error' }
  }

  const lineErrors: number[] = []

  const userUpserts = users.map((u, index) => {
    const parsedUser = userSchema.safeParse(u)
    if (!parsedUser.success) {
      lineErrors.push(index)
      // a failed parse returns undefined which resolves immediately
      return undefined
    }

    const validatedUser = parsedUser.data

    return prisma.user.upsert({
      where: {
        admissionsCycle_login: {
          admissionsCycle: validatedUser.admissionsCycle,
          login: validatedUser.login
        }
      },
      update: validatedUser,
      create: validatedUser
    })
  })

  await Promise.all(userUpserts)

  const noSuccesses = users.length - lineErrors.length
  if (lineErrors.length === 0) {
    return {
      message: `${noSuccesses}/${users.length} users updated or inserted successfully`,
      status: 'success'
    }
  }
  return {
    message: `${lineErrors.length}/${users.length} updates or inserts failed`,
    status: 'error'
  }
}
