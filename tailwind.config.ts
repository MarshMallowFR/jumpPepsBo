import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        white: '#FFFFFF',
        gray: '#F0EFEE',
        black: '#000000',
        orange: {
          light: '#FFBC79',
          medium: '#FA8919',
        },
      },
      boxShadow: {
        'custom-shadow': '0 6px 20px rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;

// OLD
// import type { Config } from 'tailwindcss';

// const config: Config = {
//   content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//     extend: {
//       gridTemplateColumns: {
//         '13': 'repeat(13, minmax(0, 1fr))',
//       },
//       colors: {
//         blue: {
//           400: '#2589FE',
//           500: '#0070F3',
//           600: '#2F6FEB',
//         },
//       },
//     },
//     keyframes: {
//       shimmer: {
//         '100%': {
//           transform: 'translateX(100%)',
//         },
//       },
//     },
//   },

//   plugins: [require('@tailwindcss/forms')],
// };
// export default config;
