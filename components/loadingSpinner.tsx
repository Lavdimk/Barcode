'use client';

import React from 'react';
import { FadeLoader } from 'react-spinners';

const LoadingSpinner = ({
  height = 15,
  width = 5,
}: {
  height?: number;
  width?: number;
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <FadeLoader height={height} width={width} />
    </div>
  );
};

export default LoadingSpinner;
