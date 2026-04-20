/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                'dark': '#0a0a0a',
                'glass': 'rgba(255, 255, 255, 0.03)',
                'glass-hover': 'rgba(255, 255, 255, 0.08)',
                'accent-cyan': 'var(--accent-cyan)',
                "primary": "#11d4d4",
                "background-light": "#f6f8f8",
                "background-dark": "#102222",
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Outfit', 'sans-serif']
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        require('@tailwindcss/container-queries'),
    ],
}
