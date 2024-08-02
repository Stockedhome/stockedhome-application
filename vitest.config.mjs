import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        setupFiles: ['dotenv/config'],
        exclude: [
            '**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
            './src/forks/**'
        ],
    },
})
