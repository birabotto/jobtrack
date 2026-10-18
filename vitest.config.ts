
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/lib/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.d.ts",
                "src/**/*.{test,spec}.{ts,tsx}",
                "src/test/**",
                "src/lib/supabase/**"
            ]
        }
    }
});
