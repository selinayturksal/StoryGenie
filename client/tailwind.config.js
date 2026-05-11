/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'masal-cream':        'rgb(249, 244, 227)',
        'masal-blue':         'rgb(84,  151, 167)',
        'masal-purple':       'rgb(117,  70, 104)',
        'masal-purple-dark':  'rgb(82,   48,  72)',
        'masal-blue-dark':    'rgb(58,  112, 126)',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body:    ['Nunito', 'sans-serif'],
      },
      animation: {
        'float':       'catFloat 4.2s ease-in-out infinite',
        'bubble':      'bubbleBounce 3.5s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2.4s ease infinite',
        'twinkle':     'twinkle 2.8s ease-in-out infinite',
      },
      keyframes: {
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
          '0%, 100%': { opacity: '0',   transform: 'scale(0.4)' },
          '50%':      { opacity: '0.75', transform: 'scale(1.1)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
