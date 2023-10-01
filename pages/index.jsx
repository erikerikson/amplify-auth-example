import { Button, useAuthenticator } from '@aws-amplify/ui-react'
import React from 'react'

import Authenticated from '../components/authenticated.jsx'

export default function Index() {
  const { signOut, user } = useAuthenticator((context) => [context.user])
  return (
    <Authenticated>
      <Button onClick={signOut}>Sign Out</Button>
      <p>User Attributes</p>
      <pre>
        {
          JSON.stringify(user?.attributes, null, 2)
        }
      </pre>
      <p>User (Full)</p>
      <pre>
        {
          JSON.stringify(user, null, 2)
        }
      </pre>
    </Authenticated>
  )
}
