import { HomeIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import Link from 'next/link'
import { FC } from 'react'

const HomepageLinkButton: FC = () => {
  return (
    <Link href="/">
      <Button color="gold">
        <HomeIcon />
        Return to homepage
      </Button>
    </Link>
  )
}

export default HomepageLinkButton
