export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {}, // Keeping autoprefixer is usually fine, or I can remove it if redundant, but standard Vite templates often keep it.
    },
}
