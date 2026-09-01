// src/components/common/MotionMenuItem.jsx
import { MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -6 }
};

export const MotionMenuItem = motion(MenuItem, { forwardMotionProps: true });
MotionMenuItem.defaultProps = { 
  variants: item
};
