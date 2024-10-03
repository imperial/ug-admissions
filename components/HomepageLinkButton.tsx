import { HomeIcon } from '@radix-ui/react-icons'
import { Flex } from '@radix-ui/themes'
import Link from 'next/link'
import { FC } from 'react'

const HomepageLinkButton: FC = () => {
  return (
    <Link href="/">
      <Flex align="center" justify="center" gap="2">
        <HomeIcon />
        Return to homepage
      </Flex>
    </Link>
  )
}

export default HomepageLinkButton
