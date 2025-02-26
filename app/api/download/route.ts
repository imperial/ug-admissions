import { getAllOutcomes } from '@/lib/query/applications'
import { AsyncParser } from '@json2csv/node'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cycle = request.nextUrl.searchParams.get('cycle')
  if (!cycle || isNaN(Number(cycle)))
    return new NextResponse('Invalid or missing cycle parameter', { status: 400 })

  try {
    const outcomes = await getAllOutcomes(Number(cycle))
    if (!Array.isArray(outcomes) || outcomes.length === 0) {
      return new NextResponse('No data available for the given cycle', { status: 404 })
    }

    const parser = new AsyncParser()
    const csv = await parser.parse(outcomes).promise()

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="outcomes_${cycle}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return new NextResponse(`Failed to generate CSV: ${error}`, { status: 500 })
  }
}
