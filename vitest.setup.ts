import { vi } from 'vitest';

// Silence the console during the CI build to make the build log easier to read
if (process.env.CI === 'true') {
    global.console = {
        ...console,
        log: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    };
}