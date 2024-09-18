import { Comment as PrismaComment } from '@prisma/client'
import { FC } from 'react'

interface CommentProps {
  comment: PrismaComment
}

const CommentItem: FC<CommentProps> = ({ comment }) => {
  return (
    <div>
      <h1>{comment.text}</h1>
    </div>
  )
}

export default CommentItem
