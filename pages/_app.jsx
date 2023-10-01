import PropTypes from 'prop-types'
import React from 'react'

import Auth from '../components/auth.jsx'

export default function App({ Component, pageProps = {} }) {
  return (
    <Auth>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
    </Auth>
  )
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.shape({}).isRequired,
}
