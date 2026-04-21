import { createTheme } from '@mui/material/styles';

// ─── Design tokens ─────────────────────────────────────────────────────────────

export const C = {
  // Backgrounds
  bgPage:      '#f7f7f7',
  bgPaper:     '#fcfcfc',
  bgBaseGray:  '#f1f1f1',
  // Text
  black:       '#222222',
  grey:        '#28313e',
  grayMid:     '#808080',
  // Brand / Interactive
  blue:        '#223377',   // nav active, brand headings
  blueLight:   '#1166bb',   // CTAs, links
  blueLightBg: '#e1eaf7',   // hover fills, selected rows
  // Borders
  divider:     '#e8e8e8',
  darkGray:    '#c0c0c0',   // input borders
  // Status
  green:       '#4f8406',
  greenLight:  '#88BFA1',
  orange:      '#b25f01',
  yellow:      '#FFA000',
  red:         '#c91717',
  purple:      '#7255d3',
  pink:        '#ff5391',
};

// Legacy alias exported for components that still reference it
export const colors = {
  primary:       C.blueLight,
  primaryDark:   C.blue,
  primaryLight:  C.blueLightBg,
  secondary:     C.purple,
  error:         C.red,
  warning:       C.orange,
  surface:       C.bgPaper,
  background:    C.bgPage,
  textPrimary:   C.black,
  textSecondary: C.grayMid,
};

// Status pill style map — consumed by both QuoteLog and NewRFP
export const statusChipStyles = {
  'Census Received':     { bg: '#fff8e1', color: C.orange },
  'Ready for Associate': { bg: C.blueLightBg, color: C.blue },
  'Census Loaded':       { bg: '#edf5d9', color: C.green },
  'Waiting':             { bg: '#fff8e1', color: C.orange },
  'SoB / Risk Received': { bg: '#edf5d9', color: C.green },
  'SoB / Risk Entered':  { bg: '#edf5d9', color: C.green },
  'Received':            { bg: '#edf5d9', color: C.green },
  'In Progress':         { bg: C.blueLightBg, color: C.blueLight },
  'Entered':             { bg: '#edf5d9', color: C.green },
  'Done':                { bg: '#edf5d9', color: C.green },
  'DTQ':                 { bg: '#fdecea', color: C.red },
  'Rush':                { bg: '#fff3e0', color: C.orange },
  'Handed Off':          { bg: C.bgBaseGray, color: C.grayMid },
  'Renewal':             { bg: '#edf5d9', color: C.green },
  'New Business':        { bg: C.blueLightBg, color: C.blueLight },
};

// ─── MUI theme ────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary:    { main: C.blueLight, dark: C.blue, light: C.blueLightBg, contrastText: '#fff' },
    secondary:  { main: C.purple, contrastText: '#fff' },
    error:      { main: C.red },
    warning:    { main: C.orange },
    background: { default: C.bgPage, paper: C.bgPaper },
    text:       { primary: C.black, secondary: C.grayMid },
    divider:    C.divider,
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontSize: '24px', fontWeight: 600, color: C.black },
    h2: { fontSize: '20px', fontWeight: 600, color: C.black },
    h3: { fontSize: '16px', fontWeight: 600, color: C.black },
    h4: { fontSize: '15px', fontWeight: 500, color: C.black },
    h5: { fontSize: '14px', fontWeight: 500, color: C.black },
    h6: { fontSize: '13px', fontWeight: 500, color: C.black },
    body1: { fontSize: '14px', fontWeight: 400, lineHeight: 1.6, color: C.black },
    body2: { fontSize: '13px', fontWeight: 400, lineHeight: 1.6, color: C.black },
    caption: { fontSize: '11px', fontWeight: 400, color: C.grayMid },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '13px' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '13px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          backgroundColor: C.blueLight,
          '&:hover': { backgroundColor: '#0e57a0' },
        },
        outlined: {
          borderColor: C.divider,
          color: C.black,
          '&:hover': { borderColor: C.darkGray, backgroundColor: 'transparent' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none', border: `1px solid ${C.divider}`, backgroundColor: C.bgPaper },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: C.bgPaper },
        rounded: { borderRadius: 8 },
        elevation0: { boxShadow: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          height: 22,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '14px',
          backgroundColor: C.bgPaper,
          '& fieldset': { borderColor: C.darkGray },
          '&:hover fieldset': { borderColor: C.blueLight },
          '&.Mui-focused fieldset': {
            borderColor: C.blueLight,
            boxShadow: `0 0 0 3px rgba(17,102,187,0.12)`,
          },
        },
        input: { padding: '0 12px', height: '40px', boxSizing: 'border-box', fontSize: '14px' },
        inputSizeSmall: { padding: '0 12px', height: '36px', boxSizing: 'border-box', fontSize: '13px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '14px', color: C.grayMid },
        sizeSmall: { fontSize: '13px' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        select: { fontSize: '14px' },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        option: { fontSize: '14px' },
        input: { fontSize: '14px' },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontSize: '13px',
          border: 'none',
          '--DataGrid-rowBorderColor': C.divider,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: C.bgPage,
            borderBottom: `1px solid ${C.divider}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '11px',
            color: C.grayMid,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${C.divider}`,
            padding: '0 16px',
            outline: 'none !important',
            fontSize: '13px',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-row:hover': { backgroundColor: C.blueLightBg },
          '& .MuiDataGrid-row.Mui-selected': { backgroundColor: `${C.blueLightBg} !important` },
          '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': { borderBottom: 'none' },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '1px 8px',
          padding: '10px 12px',
          '&.Mui-selected': {
            backgroundColor: C.blueLightBg,
            color: C.blue,
            '& .MuiListItemIcon-root': { color: C.blueLight },
            '&:hover': { backgroundColor: C.blueLightBg },
          },
          '&:hover': { backgroundColor: C.bgBaseGray },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: C.bgPaper,
          color: C.black,
          boxShadow: `0 1px 0 ${C.divider}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: C.divider } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 6, fontSize: '13px' } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '12px', backgroundColor: C.grey, borderRadius: 4 },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 400, fontSize: '14px' } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 4, height: 4 } },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: C.blueLight },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: C.blueLight },
        },
      },
    },
    MuiSnackbar: {
      defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'center' } },
    },
  },
});

export default theme;
