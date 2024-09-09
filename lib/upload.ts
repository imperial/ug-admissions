'use server'

import prisma from '@/db'
import { Role, type User } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'

import { FormPassbackState } from './types'

const RoleEnum = z.nativeEnum(Role)

const userSchema = z.object({
  admissionsCycle: z.coerce.number(),
  login: z.string(),
  role: RoleEnum
})

export const insertUploadedData = async (
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const csv = formData.get('csv') as File
  const lines = await csv.text()

  const users: Omit<User, 'id'>[] = parse(lines, {
    columns: true,
    skip_empty_lines: true
  })

  console.log(users)
  const userUpserts = users.map((u) => {
    const validatedUser = userSchema.parse(u)
    console.log(validatedUser)
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
  return { message: '', status: 'success' }
}
