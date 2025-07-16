import { vi } from 'vitest';

// Mock Guardian CDK constants
vi.mock('@guardian/cdk/lib/constants/library-info', () => ({
  LibraryInfo: {
    VERSION: 'TEST'
  }
}));

vi.mock('@guardian/cdk/lib/constants/tracking-tag', () => ({
  TrackingTag: {
    Key: 'gu:cdk:version',
    Value: 'TEST'
  }
}));

vi.mock('@guardian/cdk/lib/constants/metadata-keys', () => ({
  MetadataKeys: {
    VERSION: 'gu:cdk:version'
  }
}));

// Mock private infrastructure config
vi.mock('@guardian/private-infrastructure-config', () => {
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