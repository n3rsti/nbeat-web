/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'queue': 'auto minmax(0, 1fr) auto',
        'chat': 'auto auto minmax(0, 1fr) auto'
      }
    },
  },
  plugins: [],
}

