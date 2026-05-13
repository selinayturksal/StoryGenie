/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Mevcut Night Sky renkleri */
        'masal-cream':        'rgb(249, 244, 227)',
        'masal-blue':         'rgb(84,  151, 167)',
        'masal-purple':       'rgb(117,  70, 104)',
        'masal-purple-dark':  'rgb(82,   48,  72)',
        'masal-blue-dark':    'rgb(58,  112, 126)',
        /* StoryGenie açık tema renkleri */
        'sg-sky':        '#f0f7ff',
        'sg-sky-mid':    '#c2e0ff',
        'sg-sun':        '#ffe566',
        'sg-sun-deep':   '#ffb800',
        'sg-coral':      '#ff7b5c',
        'sg-coral-soft': '#ffb39e',
        'sg-teal':       '#00c9a7',
        'sg-teal-soft':  '#7eecd8',
        'sg-plum':       '#9b59b6',
        'sg-plum-soft':  '#d4a8e8',
        'sg-lime':       '#7bc67e',
        'sg-ink':        '#1a1a2e',
        'sg-ink-mid':    '#4a4a6a',
        'sg-ink-soft':   '#8888aa',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body:    ['Nunito', 'sans-serif'],
      },
      animation: {
        /* Mevcut animasyonlar */
        'float':       'catFloat 4.2s ease-in-out infinite',
        'bubble':      'bubbleBounce 3.5s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2.4s ease infinite',
        'twinkle':     'twinkle 2.8s ease-in-out infinite',
        /* StoryGenie animasyonları */
        'sg-float':    'sgFloat 4s ease-in-out infinite',
        'sg-pop':      'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'sg-fade':     'fadeInUp 0.5s ease both',
        'sg-gradient': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        /* Mevcut keyframe'ler */
        catFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%':      { transform: 'translateY(-16px) rotate(1.5deg)' },
          '66%':      { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        bubbleBounce: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%':      { transform: 'translateY(-7px) rotate(1.2deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0',    transform: 'scale(0.4)' },
          '50%':      { opacity: '0.75', transform: 'scale(1.1)' },
        },
        /* StoryGenie keyframe'leri */
        sgFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.7) translateY(12px)' },
          '70%':  { transform: 'scale(1.05) translateY(-3px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(18px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};