import { vi } from 'vitest';

// Set test environment variables that Guardian CDK might check
process.env.NODE_ENV = 'test';
process.env.CDK_DEFAULT_REGION = 'eu-west-1';
process.env.CDK_DEFAULT_ACCOUNT = '123456789012';
process.env.GUARDIAN_CDK_VERSION = 'TEST';

// Try mocking at the module level
const mockTrackingTag = {
  Key: 'gu:cdk:version',
  Value: 'TEST'
};

const mockLibraryInfo = {
  VERSION: 'TEST'
};

// Override the modules after they're loaded
vi.mock('@guardian/cdk/lib/constants/tracking-tag', () => {
  return { TrackingTag: mockTrackingTag };
});

vi.mock('@guardian/cdk/lib/constants/library-info', () => {
  return { LibraryInfo: mockLibraryInfo };
});


vi.doMock('@guardian/cdk/lib/constants/metadata-keys', () => ({
  MetadataKeys: {
    VERSION: 'gu:cdk:version'
  }
}));

// Mock private infrastructure config
vi.doMock('@guardian/private-infrastructure-config', () => {
  const mockConfig = {
    organizationUnits: ['ou-123'],
    memberRoleName: 'cloudquery-access',
    GuardianPrivateNetworks: {
      Engineering: '10.0.0.0/8'
    },
    GuardianOrganisationalUnits: {
      Root: 'ou-123'
    },
    GuardianAwsAccounts: {
      Security: '000000000015',
      DeployTools: '000000000016'
    }
  };
  
  return {
    default: mockConfig,
    ...mockConfig
  };
});

// Set consistent environment
process.env.CDK_DEFAULT_REGION = 'eu-west-1';
process.env.CDK_DEFAULT_ACCOUNT = '123456789012';