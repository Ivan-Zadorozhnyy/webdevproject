import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#ff1744',
        },
        background: {
            default: '#f0f2f5',
        },
    },
});

export default theme;
