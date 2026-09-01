// src/theme.js
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // A standard blue for primary actions (similar to Uber/Yango)
      // main: 'rgb(21, 57, 112)', // Your current blue
    },
    secondary: {
      main: '#f50057', // A vibrant accent color
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f4f6f8', // Light background for overall page
      paper: '#ffffff',   // White background for cards, modals etc.
      dark: '#1a202c',    // For dark sections/modals if you want a dark mode part
    },
    text: {
      primary: '#1A202C', // Dark text for readability
      secondary: '#6B7280', // Lighter text for labels/hints
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Or a custom font
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1A202C',
    },
    h6: { // For modal titles
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1A202C',
    },
    body1: {
      fontSize: '1rem',
      color: '#1A202C',
    },
    button: {
      textTransform: 'none', // Keep button text as is, common in modern UIs
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded corners for buttons
          padding: '12px 24px',
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(33, 150, 243, 0.25)', // Subtle shadow
          '&:hover': {
            backgroundColor: '#1976d2',
          },
        },
        outlined: {
            borderColor: 'rgba(0,0,0,0.1)', // Lighter border
            color: 'inherit',
        },
        text: {
            color: '#2196f3', // Keep the blue text button
            '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.04)',
            },
        }
      },
    },
    MuiTextField: { // For input fields
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f8f8f8', // Light background for inputs
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2196f3',
              borderWidth: '2px', // Highlight on focus
            },
            '& input': {
              padding: '14px 12px', // Comfortable padding
            },
          },
          '& .MuiInputLabel-root': { // Label styling
            color: '#6B7280',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#2196f3',
          },
        },
      },
    },
    MuiModal: {
        styleOverrides: {
            root: {
            }
        }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 30, // More rounded for general containers
            }
        }
    }
  },
});

export default theme;