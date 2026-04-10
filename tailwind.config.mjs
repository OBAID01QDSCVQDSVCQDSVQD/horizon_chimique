/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#29ABE2", // Bleu ciel (Sky Blue - matches typical logo color)
                    light: "#6DD3F7",
                    dark: "#0F78A8",    // Darker shade for contrast/hover
                },
                secondary: {
                    DEFAULT: "#64748B", // Technical Gray
                    light: "#94A3B8",
                },
                surface: "#F8FAFC", // Light gray/white background
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'var(--font-noto-arabic)', 'ui-sans-serif', 'system-ui'],
                arabic: ['var(--font-noto-arabic)', 'sans-serif'],
            },
            backgroundImage: {
                'hero-pattern': "linear-gradient(to right bottom, #29ABE2, #0F78A8)",
            },
        },
    },
    plugins: [],
};
