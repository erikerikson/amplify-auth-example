import { withAuthenticator } from '@aws-amplify/ui-react'

import { options, Sign } from '../components/sign.jsx'

export default withAuthenticator(Sign, { ...options, initialState: 'signUp' })
