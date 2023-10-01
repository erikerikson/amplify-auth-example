'use client'

import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import PropTypes from 'prop-types'
import React from 'react'

import '@aws-amplify/ui-react/styles.css' // eslint-disable-line import/no-unresolved

const {
  AWS_REGION,
  AWS_USER_POOL_ID,
  AWS_USER_POOL_WEB_CLIENT_ID,
} = process.env
const config = {
  Auth: {
    region: AWS_REGION,
    userPoolId: AWS_USER_POOL_ID,
    userPoolWebClientId: AWS_USER_POOL_WEB_CLIENT_ID,
    mandatorySignIn: false,
    signUpVerificationMethod: 'code',
  },
}

Amplify.configure(config)

export default function Auth({ children }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>
}

Auth.propTypes = {
  children: PropTypes.node.isRequired,
}
