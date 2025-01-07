import { CommentType, Comment as PrismaComment } from '@prisma/client'
import { Badge, Card, Flex, Text } from '@radix-ui/themes'
import { format } from 'date-fns'
import { FC } from 'react'

interface CommentProps {
  comment: PrismaComment
}

const CommentTypeBadgeMap = {
  [CommentType.NOTE]: <Badge color="orange">Note</Badge>,
  [CommentType.CANDIDATE_CHANGE_REQUEST]: <Badge color="blue">Candidate Change Request</Badge>,
  [CommentType.OFFER_CONDITION]: <Badge color="green">Offer Condition</Badge>,
  [CommentType.AMEND_OFFER]: <Badge color="red">Amend Offer</Badge>
}

const CommentItem: FC<CommentProps> = ({ comment }) => {
  return (
    <Card>
      <Flex direction="column">
        {CommentTypeBadgeMap[comment.type]}
        <Flex gap="3" align="center">
          <Text weight="medium" size="3" className="ml-1">
            {comment.authorLogin}
          </Text>{' '}
          <Text size="2" color="gray">
            {format(new Date(comment.madeOn), 'HH:mm dd/MM/yyyy')}
          </Text>
        </Flex>
      </Flex>
      <Text size="2" className="ml-2">
        {comment.text}
      </Text>
    </Card>
  )
}

export default CommentItem
