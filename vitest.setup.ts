import { vi } from 'vitest';

vi.mock('@guardian/cdk/lib/constants/tracking-tag');
vi.mock('@guardian/private-infrastructure-config');


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