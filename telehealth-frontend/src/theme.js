import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',         },
        secondary: {
            main: '#19857b',         },
        error: {
            main: '#red',         },
        background: {
            default: '#fff',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
    });

export default theme;