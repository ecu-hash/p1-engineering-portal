/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'p1': {
          'bg':       '#FFFFFF',
          'bg-alt':   '#F7F7F7',
          'surface':  '#FAFAFA',
          'border':   '#E5E5E5',
          'text':     '#0A0A0A',
          'sub':      '#666666',
          'dim':      '#999999',
          'black':    '#0A0A0A',
          'white':    '#FFFFFF',
        }
      },
    },
  },
  plugins: [],
}
