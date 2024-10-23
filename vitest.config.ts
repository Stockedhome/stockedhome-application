import { configDefaults, defineConfig } from 'vitest/config'
import AutoImport from 'unplugin-auto-import/vite'

// @ts-ignore -- really man? readonly?
process.env.NODE_ENV = 'testing';

export default defineConfig({
    plugins: [
        AutoImport({
            imports: ['vitest'],
            dts: true, // generate TypeScript declaration at the project root so TS knows what's up
        }),
    ],
    test: {
        setupFiles: ['dotenv/config'],
        exclude: [
            ...configDefaults.exclude,
            'src/forks/**',
        ],
        hideSkippedTests: true,
        chaiConfig: {
            truncateThreshold: 0,
        },
        passWithNoTests: false,
        typecheck: {
            include: ['./src/**/*.test.ts', './tests/**/*.test.ts'],
            enabled: true,
            exclude: [
                ...configDefaults.exclude,
                'src/forks/**',
            ],
            ignoreSourceErrors: true,
        }
    },
})
