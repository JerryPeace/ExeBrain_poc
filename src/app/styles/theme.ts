'use client';
import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

export default theme;
