import { getAllOffers } from '@/lib/query/applications'
import { parse } from 'json2csv'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cycle = request.nextUrl.searchParams.get('cycle')

  if (!cycle || isNaN(Number(cycle))) {
    return new NextResponse('Invalid or missing cycle parameter', { status: 400 })
  }

  try {
    const offers = await getAllOffers(Number(cycle))
    if (!Array.isArray(offers) || offers.length === 0) {
      return new NextResponse('No data available for the given cycle', { status: 404 })
    }

    const csv = parse(offers)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="offers_${cycle}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return new NextResponse(`Failed to generate CSV: ${error}`, { status: 500 })
  }
}
