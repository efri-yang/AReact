import React from 'react'
import ReactSpinner from 'nd-rc/lib/spinner'

export default props => {
  const defaultConfig = {
    zIndex: '99'
  }

  let { config } = props

  if (config) {
    config = { ...defaultConfig, ...config }
  } else {
    config = defaultConfig
  }

  return <ReactSpinner {...props} config={config} />
}
