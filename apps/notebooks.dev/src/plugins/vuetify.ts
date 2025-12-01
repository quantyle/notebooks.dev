/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Grayscale tokens (feel free to tweak)
const monoLight = {
  dark: false,
  colors: {
    'background': '#FFFFFF',
    // 'background-dark': '#a2cae0',
    'background-dark': '#ffffff',
    'surface': '#FFFFFF',
    'primary': '#2b7c61ff',
    'secondary': '#2b7c61ff',
    'secondary-dark': '#23624d',

    'success': '#2E7D32', // optional accent; keep muted if you prefer pure mono
    'warning': '#B26A00',
    'error': '#B00020',
    'info': '#0277BD',

    // “On” colors for text/icons laid on top of the above tokens
    'on-background': '#111111',
    'on-surface': '#111111',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',

    // Subtle grays you can reference in styles/classes
    'surface-1': '#F7F7F7',
    'surface-2': '#EFEFEF',
    'border': '#000000',
    'muted': '#757575',
  },
}

const monoDark = {
  dark: true,
  colors: {
    'background': '#0F0F10',
    'surface': '#141415',
    'primary': '#EDEDED',
    'secondary': '#C8C8C8',
    'success': '#7CC07F',
    'warning': '#FFC04D',
    'error': '#FF6B7A',
    'info': '#7FB8E6',

    'on-background': '#F2F2F2',
    'on-surface': '#F2F2F2',
    'on-primary': '#111111',
    'on-secondary': '#111111',

    'surface-1': '#1A1A1B',
    'surface-2': '#202021',
    'border': '#858585',
    'muted': '#d0d0d0',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'monoLight',
    themes: {
      monoLight,
      monoDark,
    },
  },
})
