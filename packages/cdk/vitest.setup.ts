import { vi } from 'vitest';

// Set fixed time for consistent snapshots
const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');
vi.useFakeTimers();
vi.setSystemTime(FIXED_DATE);

// Suppress CDK warnings in tests
global.console = {
  ...console,
  warn: vi.fn(),
};