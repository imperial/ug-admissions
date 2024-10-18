import { decimalToString } from '@/lib/utils'
import { Decimal } from '@prisma/client/runtime/binary'
import { Card, Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'

interface TmuaGradeBoxProps {
  score: Decimal | null
}

const TmuaGradeBox: FC<TmuaGradeBoxProps> = ({ score }) => {
  return (
    <Card className="bg-gray-300">
      <Flex direction="column" gap="2" align="center">
        <Heading size="2">TMUA Score: {decimalToString(score)} / 9</Heading>
      </Flex>
    </Card>
  )
}

export default TmuaGradeBox
