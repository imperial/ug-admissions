import { CommentType, Comment as PrismaComment } from '@prisma/client'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Badge, Card, Flex, Text } from '@radix-ui/themes'
import { formatDistanceToNow } from 'date-fns'
import { FC } from 'react'

interface CommentProps {
  comment: PrismaComment
}

const CommentTypeBadgeMap = {
  [CommentType.NOTE]: <Badge color="orange">Note</Badge>,
  [CommentType.CANDIDATE_CHANGE_REQUEST]: <Badge color="blue">Candidate Change Request</Badge>,
  [CommentType.OFFER_CONDITION]: <Badge color="green">Offer Condition</Badge>
}

const CommentItem: FC<CommentProps> = ({ comment }) => {
  return (
    <Card>
      <Flex>
        <Flex className="basis-1/6">
          <Pencil2Icon className="w-6 h-6" />
        </Flex>

        <Flex className="basis-5/6" direction="column">
          <Flex justify="between" align="center">
            <Flex align="center" gap="2">
              <Text weight="bold" size="3">
                {comment.authorLogin}
              </Text>
              <Text size="1" weight="light">
                {`${formatDistanceToNow(comment.madeOn)} ago`}
              </Text>
            </Flex>
            {CommentTypeBadgeMap[comment.type]}
          </Flex>
          <Text size="2">{comment.text}</Text>
        </Flex>
      </Flex>
    </Card>
  )
}

export default CommentItem
