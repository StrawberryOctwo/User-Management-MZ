// src/components/SmartSchedule/MotionComponents.tsx
import React from 'react';
import { Paper, PaperProps, Backdrop, BackdropProps } from '@mui/material';
import { motion } from 'framer-motion';

// Create a motion-enhanced Paper component
const MotionPaper = motion(
  React.forwardRef<HTMLDivElement, PaperProps>((props, ref) => (
    <Paper ref={ref} {...props} />
  ))
);

// Create a motion-enhanced Backdrop component
const MotionBackdrop = motion(
  React.forwardRef<HTMLDivElement, BackdropProps>((props, ref) => (
    <Backdrop ref={ref} {...props} />
  ))
);

export { MotionPaper, MotionBackdrop };
