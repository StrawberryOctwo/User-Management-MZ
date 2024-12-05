import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    [key: string]: any; // Allow any property on the theme
  }

  interface ThemeOptions {
    [key: string]: any; // Allow any property in theme creation
  }
}
