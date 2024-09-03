'use client'

import { loadApplicants } from '@/lib/loadCSV'
import React from 'react'

const TempButton = () => {
  return <button onClick={loadApplicants}>load applicants</button>
}

export default TempButton
