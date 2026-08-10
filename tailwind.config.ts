import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F4D3F',
          50: '#e7f5f2',
          100: '#c2e6de',
          200: '#9dd7c9',
          300: '#78c7b5',
          400: '#53b8a0',
          500: '#3eb094',
          600: '#0F4D3F',
          700: '#0c3d32',
          800: '#0a3028',
          900: '#07241e',
          950: '#041612',
        }
      }
    }
  }
}
