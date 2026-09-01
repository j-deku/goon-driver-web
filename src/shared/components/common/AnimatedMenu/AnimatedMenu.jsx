// src/components/common/AnimatedMenu.jsx
import React from 'react';
import { Popper, Paper, MenuList, ClickAwayListener, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25, staggerChildren: 0.06 }
  },
  exit: { opacity: 0, scale: 0.95 }
};

export default function AnimatedMenu({ anchorEl, open, onClose, children }) {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      disablePortal
      style={{ zIndex: 1300, position:"absolute", right:0}}
    >
      {({ TransitionProps }) => (
        <AnimatePresence>
          {open && (
            <motion.div
              key="menu"
              variants={container}
              initial="hidden"
              animate="visible"
              exit="exit"
              {...TransitionProps}
            >
              <ClickAwayListener onClickAway={onClose}>
                <Paper
                  elevation={6}
                  sx={{ borderRadius: 2, overflow: 'hidden', minWidth: 180, mt: 1 }}
                >
                  {/* Wrap MenuList with motion for the stagger to propagate */}
                  <MenuList component={motion.ul} sx={{ p: 0 }}>
                    {children}
                  </MenuList>
                </Paper>
              </ClickAwayListener>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Popper>
  );
} 
