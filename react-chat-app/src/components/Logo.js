import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ size = 24, color = '#fff', sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <svg 
        width={size} 
        height={size * (24/14)} 
        viewBox="0 0 14 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          id="Shape" 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M7.08727 24C13.928 24 14.0051 20.691 13.9998 18.9609V5.03907C14.005 3.30907 13.928 0 7.08727 0H6.91209C0.071432 0 -0.0051097 3.30907 0.000172744 5.03907V18.9609C-0.0052175 20.691 0.0713239 24 6.91209 24H7.08727ZM6.99997 20.8402C6.30915 20.8415 5.93367 20.5667 5.93162 20.0162V3.98376C5.93367 3.43286 6.30915 3.15857 6.99997 3.16069C7.69089 3.15857 8.06627 3.43276 8.06799 3.98376V20.0162C8.06627 20.5667 7.69089 20.8416 6.99997 20.8402Z" 
          fill={color}
        />
      </svg>
    </Box>
  );
};

export default Logo;

