import prisma from '@/db'
import { Table } from '@radix-ui/themes'

export default async function Home() {
  const applications = await prisma.application.findMany({
    include: { applicant: true }
  })
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>CID</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>UCAS Number</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>First name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Last name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Fee status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Widening Participation</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {applications.map((application) => (
          <Table.Row key={application.id}>
            <Table.RowHeaderCell>{application.applicant.cid}</Table.RowHeaderCell>
            <Table.Cell>{application.applicant.ucasNumber}</Table.Cell>
            <Table.Cell>{application.applicant.firstName}</Table.Cell>
            <Table.Cell>{application.applicant.surname}</Table.Cell>
            <Table.Cell>{application.feeStatus}</Table.Cell>
            <Table.Cell>{application.wideningParticipation.toString()}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
