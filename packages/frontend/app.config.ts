import { defineConfig } from '@tanstack/start/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        compatibilityDate: "2024-11-05",
        preset: "aws-lambda",
    },
    vite: {
        plugins: [
            viteTsConfigPaths({
                projects: ["./tsconfig.json"],
            }),
        ],
    },
});