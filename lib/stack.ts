import {
  App,
  Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import {
  AccountRecovery,
  CfnUserPoolUICustomizationAttachment,
  Mfa,
  OAuthScope,
  ResourceServerScope,
  UserPool,
  UserPoolEmail,
  VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito'
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { UserPoolDomainTarget } from 'aws-cdk-lib/aws-route53-targets'

import config from 'lib/config'
import props from 'lib/stackProps'
import validate from 'lib/validate'

// Constants

// Util
type UrlMaker = (host: string, path: string) => string
const url = (protocol: string): UrlMaker => (host: string, path: string): string => `${protocol}://${host}/${path}`
const httpUrl = url('http')
const httpsUrl = url('https')

// First Validate that the user has credentials
validate()

// Config Values
const {
  apiHost,
  authHost,
  emails: {
    security: emailSecurity,
    support: emailSupport,
  },
  host,
  hostCoreDomain,
  name,
  wwwHost,
} = config.env()

// $ENV differentiation
const isDev = name === 'dev'
const isProd = name === 'prod'

const coredomainZoneDomainName = name === 'prod' ? authHost : hostCoreDomain

// ### Begin Stack ###
const app = new App()
export const globalStack = new Stack(app, `${name}-auth-global`, props({
  env: {
    region: 'us-east-1',
  },
  crossRegionReferences: true,
}))
export const stack = new Stack(app, `${name}-auth-stack`, props({
  crossRegionReferences: true,
}))

// Bootstrap Resources
const coredomainZone = PublicHostedZone.fromLookup(stack, `${name}-hosted-zone`, {
  domainName: coredomainZoneDomainName,
})

// Global Stack Resources
export const authCertificate = new Certificate(globalStack, `${name}-auth-cert`, {
  domainName: authHost,
  validation: CertificateValidation.fromDns(coredomainZone),
})

// Stack Resources

// Email domain authentication/identity is already set up for SES (Simple Email Service) in the
// bootstrap scripts

export const userPool = new UserPool(stack, `${name}-auth-user-pool`, {
  accountRecovery: AccountRecovery.EMAIL_ONLY,
  autoVerify: { email: true },
  deletionProtection: isProd,
  deviceTracking: {
    challengeRequiredOnNewDevice: true,
    deviceOnlyRememberedOnUserPrompt: true,
  },
  email: UserPoolEmail.withSES({
    fromEmail: emailSecurity,
    fromName: 'ProductDomain',
    replyTo: emailSupport,
    sesVerifiedDomain: host,
  }),
  keepOriginal: { email: true },
  mfa: Mfa.OPTIONAL,
  mfaMessage: 'Your authentication code is {####}',
  mfaSecondFactor: {
    sms: false,
    otp: true,
  },
  removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
  selfSignUpEnabled: true,
  signInAliases: {
    email: true,
    username: false,
  },
  signInCaseSensitive: false,
  standardAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    fullname: {
      required: true,
      mutable: true,
    },
  },
  userPoolName: `${name}-auth-user-pool`,
  userVerification: {
    emailBody: 'Your email verification code is {####}',
    emailStyle: VerificationEmailStyle.CODE,
    emailSubject: 'Email Validation',
  },
})
export const authDomain = userPool.addDomain(`${name}-auth-domain`, {
  customDomain: {
    certificate: authCertificate,
    domainName: authHost,
  },
})
export const authARecord = new ARecord(stack, `${name}-auth-arecord`, {
  recordName: authHost,
  target: RecordTarget.fromAlias(new UserPoolDomainTarget(authDomain)),
  zone: coredomainZone,
})

const selfScope = new ResourceServerScope({
  scopeName: 'self',
  scopeDescription: 'Personal access to one\'s own data',
})
export const apiServer = userPool.addResourceServer(apiHost, {
  identifier: apiHost,
  scopes: [
    selfScope,
  ],
})
const callbacks = (path: string): string[] => ([
  httpsUrl(wwwHost, path),
].concat(
  isDev // add localhost into dev environments
    ? httpUrl('localhost:3000', path)
    : [],
))
const signinCallbacks = callbacks('api/auth/callback/cognito')
const signoutCallbacks = callbacks('logout')
export const webClient = userPool.addClient(`${name}-auth-client-www`, {
  userPoolClientName: `${name}-auth-client-www`,
  authFlows: {
    userSrp: true,
  },
  disableOAuth: false,
  enableTokenRevocation: true,
  generateSecret: false,
  oAuth: {
    callbackUrls: signinCallbacks,
    flows: {
      authorizationCodeGrant: true,
      implicitCodeGrant: true,
    },
    logoutUrls: signoutCallbacks,
    scopes: [
      OAuthScope.EMAIL,
      OAuthScope.PROFILE,
      OAuthScope.resourceServer(apiServer, selfScope),
    ],
  },
  preventUserExistenceErrors: true,
  // validity durations
  accessTokenValidity: Duration.days(1),
  authSessionValidity: Duration.minutes(15),
  idTokenValidity: Duration.days(1),
  refreshTokenValidity: Duration.days(365),
})
