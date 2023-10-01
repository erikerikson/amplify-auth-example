# Bug Reproduction Example

Steps to reproduce:

1. create a Cognito User Pool as roughly described in `lib/stack.ts` (CDK stack)
1. create a user in that pool (i.e. with name, email, and password)
1. open a terminal in this repo
1. run `npm ci`
1. run `npm run dev`
1. open [localhost:3000](http://localhost:3000/), you will be redirected to /signup
1. click the `Sign In` tab (credentials exist)
1. enter your email and credentials
1. click the `Sign Out` button
1. note that you are redirected to /signin but the `Create Account` tab and fields are active.  This is incorrect because the `initialState: 'signIn'` parameter was provided (as can be seen in `/pages/signin.jsx`)

Expected: the screen would have the `Sign In` tab active
