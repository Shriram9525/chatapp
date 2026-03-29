/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'chat-bg': '#0A0F1E',
                'chat-sidebar': '#0D1425',
                'chat-primary': '#7C3AED',
                'chat-primary-hover': '#6D28D9',
                'chat-secondary': '#06B6D4',
                'chat-text': '#FFFFFF',
                'chat-text-muted': '#94A3B8',
                'chat-bubble-mine': '#7C3AED',
                'chat-bubble-other': '#1E293B',
                'chat-border': '#1E293B',
            },

            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Space Grotesk', 'sans-serif'],
            },

            animation: {
                blob: 'blob 7s infinite',
                'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },

            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}