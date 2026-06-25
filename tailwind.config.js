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
                            p1: {
                                        bg:      '#0a0a0a',
                                        surface: '#111111',
                                        card:    '#161616',
                                        border:  '#262626',
                                        muted:   '#3f3f3f',
                                        text:    '#f5f5f5',
                                        sub:     '#888888',
                                        dim:     '#555555',
                            },
                  },
                  fontFamily: {
                            sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
          },
    },
    plugins: [],
}
