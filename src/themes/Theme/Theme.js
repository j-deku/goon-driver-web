// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#6e7781',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
});

export default theme;
