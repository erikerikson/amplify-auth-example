'use client'

import { useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'


const existingUser = () => { // allow differentiation between a new user and one that logged out
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('CognitoIdentityServiceProvider')) {
        return true // existing user
      }
    }
  }
  return false // new user (or localStorage was cleared)
}

export const authPath = (from) => `/${
  existingUser() ? 'signin' : 'signup'
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
