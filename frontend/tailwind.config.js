/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': '480px',
                'sm': '720px',
                'md': '1080px',
            },
            colors: {
                primary: {
                    DEFAULT: '#818cf8',
                    dark: '#6366f1',
                },
                secondary: '#c084fc',
                accent: '#fb7185',
                income: '#34d399',
                expense: '#fb7185',
            }
        },
    },
    plugins: [],
    darkMode: 'class', // We'll use [data-theme="dark"] or class="dark"
}
