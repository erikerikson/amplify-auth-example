'use client'

import { StorageHelper } from '@aws-amplify/core'
import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify } from 'aws-amplify'
import PropTypes from 'prop-types'
import React from 'react'

import '@aws-amplify/ui-react/styles.css' // eslint-disable-line import/no-unresolved

const config = {
  Auth: {
    // replace these
    region: '$AWS_REGION',
    userPoolId: '$AWS_USER_POOL_ID',
    userPoolWebClientId: '$AWS_USER_POOL_WEB_CLIENT_ID',
    mandatorySignIn: false,
    signUpVerificationMethod: 'code',
    storage: new StorageHelper().getStorage(),
  },
}

Amplify.configure(config)

export const existingUser = () => Object.keys(config.Auth.storage)
    .some((key) => key.startsWith('CognitoIdentityServiceProvider'))

export default function Auth({ children }) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>
}

Auth.propTypes = {
  children: PropTypes.node.isRequired,
}
