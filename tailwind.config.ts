import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Clash Display', 'Satoshi', 'ui-sans-serif', 'sans-serif'],
        display: ['Clash Display', 'Satoshi', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A1F1A',
          50: '#EFF3F1',
          100: '#D8E0DC',
          200: '#AFC0B9',
          300: '#82998F',
          400: '#557064',
          500: '#2F4A40',
          600: '#1C352C',
          700: '#132A22',
          800: '#0E211B',
          900: '#0A1F1A',
          950: '#06120E',
        },
        paper: {
          DEFAULT: '#F6F5EF',
          50: '#FCFBF7',
          100: '#F6F5EF',
          200: '#EDEBE1',
          300: '#E1DED1',
        },
        line: {
          DEFAULT: '#E4E4DA',
          strong: '#D3D3C6',
        },
        forest: {
          DEFAULT: '#11483A',
          50: '#E8F3EF',
          100: '#C9E4DA',
          200: '#96C9B7',
          300: '#63AE94',
          400: '#309272',
          500: '#1A7458',
          600: '#11483A',
          700: '#0D3A2F',
          800: '#092C24',
          900: '#061E18',
        },
        lime: {
          DEFAULT: '#D8F26B',
          50: '#FBFFEB',
          100: '#F4FFC7',
          200: '#EAFD97',
          300: '#E1F97D',
          400: '#D8F26B',
          500: '#C2DD4B',
          600: '#A3BE33',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          50: '#FFF1ED',
          100: '#FFDCD3',
          200: '#FFB7A5',
          300: '#FF9177',
          400: '#FF6B4A',
          500: '#F04824',
          600: '#C93617',
        },
        muted: '#6C7872',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        lift: '0 1px 0 rgba(10,31,26,0.04), 0 18px 40px -24px rgba(10,31,26,0.35)',
        card: '0 1px 2px rgba(10,31,26,0.05)',
        pop: '0 24px 70px -30px rgba(10,31,26,0.45)',
      },
      maxWidth: {
        shell: '1240px',
      },
      letterSpacing: {
        tighter2: '-0.035em',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
}
