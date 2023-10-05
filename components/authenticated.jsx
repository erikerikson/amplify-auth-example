'use client'

import { useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import { existingUser } from './auth'

const tap = () => {
  const res = existingUser()
  console.log('existing user: ', res)
  return res
}

export const authPath = (from) => `/${
  tap() ? 'signin' : 'signup'
}?from=${
  encodeURIComponent(from)
}`

export default function Authenticated({ children }) {
  const { authStatus } = useAuthenticator((context) => [context.user])
  const router = useRouter()
  const { pathname } = router
  if (authStatus !== 'authenticated' && authStatus !== 'configuring') {
    router.replace(authPath(pathname))
  } else {
    return children
  }
}

Authenticated.propTypes = {
  children: PropTypes.node.isRequired,
}
