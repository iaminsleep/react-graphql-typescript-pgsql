import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

const fonts = { mono: `'Menlo', monospace` }

const breakpoints = createBreakpoints({
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
})

const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        minWidth: "320px",
        margin: 0,
        maxWidth: "100%",
        backgroundColor: "#f9f9f9",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "16px",
        color: "rgb(15, 20, 25)",
        lineHeight: 1,
      },
    }),
  },
  semanticTokens: {
    colors: {
      text: {
        default: '#16161D',
        _dark: '#ade3b8',
      },
      heroGradientStart: {
        default: '#7928CA',
        _dark: '#e3a7f9',
      },
      heroGradientEnd: {
        default: '#FF0080',
        _dark: '#fbec8f',
      },
    },
    radii: {
      button: '12px',
    },
  },
  colors: {
    black: '#16161D',
  },
  fonts,
  breakpoints,
})

export default theme
