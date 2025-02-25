'use server'

import prisma from '@/db'
import { prettifyOption, shortenEmail } from '@/lib/utils'
import { Decision } from '@prisma/client'

export async function getApplicationsIncludingAllNested(cycle: number) {
  return prisma.application.findMany({
    include: {
      applicant: true,
      internalReview: {
        include: {
          generalComments: true
        }
      },
      reviewer: true,
      outcomes: true
    },
    where: {
      admissionsCycle: cycle
    }
  })
}

export async function getOutcomes(cycle: number) {
  return prisma.outcome.findMany({
    where: {
      application: {
        admissionsCycle: cycle
      }
    }
  })
}

export async function countNextActions(cycle: number) {
  return prisma.application.groupBy({
    by: ['nextAction'],
    where: {
      admissionsCycle: cycle
    },
    _count: {
      nextAction: true
    }
  })
}

export async function getAllOutcomes(cycle: number, decision: Decision) {
  const outcomes = await prisma.outcome.findMany({
    include: {
      application: {
        include: {
          applicant: true,
          reviewer: true,
          internalReview: {
            include: {
              generalComments: true
            }
          }
        }
      }
    },
    where: {
      decision,
      application: {
        admissionsCycle: cycle
      }
    },
    orderBy: [
      {
        application: {
          applicant: {
            surname: 'asc'
          }
        }
      },
      {
        application: {
          applicant: {
            firstName: 'asc'
          }
        }
      }
    ]
  })

  return outcomes.map((o) => ({
    'First Name': o.application.applicant.firstName,
    Surname: o.application.applicant.surname,
    CID: o.application.cid,
    'UCAS Number': o.application.applicant.ucasNumber,
    WP: prettifyOption(o.application.wideningParticipation),
    'Fee Status': prettifyOption(o.application.feeStatus),
    'Next Action': prettifyOption(o.application.nextAction),
    'TMUA Score': o.application.tmuaScore,
    'Degree Code': o.degreeCode,
    'Offer Code': o.offerCode,
    'Offer Text': o.offerText,
    'UG Tutor Form Comments': o.application.internalReview?.generalComments
      .map((c) => `${prettifyOption(c.type)}: ${c.text}`)
      .join(', '),
    'Academic Eligibility Notes': o.academicEligibilityNotes,
    Reviewer: shortenEmail(o.application.reviewer?.login),
    'Reviewer Motivation Score': o.application.internalReview?.motivationReviewerScore,
    'Reviewer Extracurricular Score': o.application.internalReview?.extracurricularReviewerScore,
    'Reviewer Reference Score': o.application.internalReview?.referenceReviewerScore,
    'Reviewer Comments': o.application.internalReview?.academicComments,
    'Age 16 Exam Type': prettifyOption(o.application.gcseQualification ?? 'N/A'),
    'Age 16 Exam Score': o.application.gcseQualificationScore,
    'Age 18 Exam Type': prettifyOption(o.application.aLevelQualification ?? 'N/A'),
    'Age 18 Exam Score': o.application.aLevelQualificationScore,
    'Admin Motivation Score': o.application.internalReview?.motivationAdminScore,
    'Admin Extracurricular Score': o.application.internalReview?.extracurricularAdminScore,
    'Exam Comments': o.application.internalReview?.examComments
  }))
}
