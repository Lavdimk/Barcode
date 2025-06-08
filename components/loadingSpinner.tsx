'use client'

import React from 'react'
import { FadeLoader } from 'react-spinners'

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <FadeLoader />
    </div>
  )
}

export default LoadingSpinner
