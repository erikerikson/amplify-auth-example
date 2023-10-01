import { useAuthenticator } from '@aws-amplify/ui-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const options = {
  loginMechanisms: ['email'],
  formFields: {
    signUp: {
      name: { order: 1 },
      email: { order: 2 },
      password: { order: 3 },
      confirm_password: { order: 4 },
    },
  },
  variation: 'modal',
}

export function Sign() {
  const router = useRouter()
  const { from } = router.query
  const { authStatus } = useAuthenticator((context) => [context.user])

  useEffect(() => {
    if (authStatus && authStatus === 'authenticated') {
      router.push(from || '/')
    }
  }, [authStatus, from])
}
