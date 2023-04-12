import { simpleGuStackForTesting } from '@guardian/cdk/lib/utils/test';
import { Template } from 'aws-cdk-lib/assertions';
import { User } from 'aws-cdk-lib/aws-iam';
import { GuDatabase } from './database';

describe('The GuDatabase construct', () => {
	it('The simplest implementation', () => {
		const stack = simpleGuStackForTesting();

		new GuDatabase(stack, 'test', {
			app: 'cloudquery',
		});

		const template = Template.fromStack(stack);
		template.resourceCountIs('AWS::RDS::DBInstance', 1);

		const [database] = Object.values(
			template.findResources('AWS::RDS::DBInstance'),
		);

		expect(database).toMatchInlineSnapshot(`
		{
		  "DeletionPolicy": "Snapshot",
		  "Properties": {
		    "AllocatedStorage": "100",
		    "CACertificateIdentifier": "rds-ca-rsa2048-g1",
		    "CopyTagsToSnapshot": true,
		    "DBInstanceClass": "db.m5.large",
		    "DBSubnetGroupName": {
		      "Ref": "testCloudquerySubnetGroupAE76545B",
		    },
		    "DeletionProtection": true,
		    "EnableIAMDatabaseAuthentication": true,
		    "Engine": "postgres",
		    "MasterUserPassword": {
		      "Fn::Join": [
		        "",
		        [
		          "{{resolve:secretsmanager:",
		          {
		            "Ref": "testCloudquerySecret1B41F53F",
		          },
		          ":SecretString:password::}}",
		        ],
		      ],
		    },
		    "MasterUsername": {
		      "Fn::Join": [
		        "",
		        [
		          "{{resolve:secretsmanager:",
		          {
		            "Ref": "testCloudquerySecret1B41F53F",
		          },
		          ":SecretString:username::}}",
		        ],
		      ],
		    },
		    "MultiAZ": true,
		    "Port": "5432",
		    "PubliclyAccessible": false,
		    "StorageEncrypted": true,
		    "StorageType": "gp2",
		    "Tags": [
		      {
		        "Key": "App",
		        "Value": "cloudquery",
		      },
		      {
		        "Key": "gu:cdk:version",
		        "Value": "TEST",
		      },
		      {
		        "Key": "gu:repo",
		        "Value": "guardian/service-catalogue",
		      },
		      {
		        "Key": "Stack",
		        "Value": "test-stack",
		      },
		      {
		        "Key": "Stage",
		        "Value": "TEST",
		      },
		    ],
		    "VPCSecurityGroups": [
		      {
		        "Fn::GetAtt": [
		          "DefaultSecurityGroupCloudquery39EED116",
		          "GroupId",
		        ],
		      },
		    ],
		  },
		  "Type": "AWS::RDS::DBInstance",
		  "UpdateReplacePolicy": "Snapshot",
		}
	`);
	});

	it('Creates an IAM Policy for IAM authentication', () => {
		const stack = simpleGuStackForTesting();

		const database = new GuDatabase(stack, 'test', {
			app: 'cloudquery',
		});

		const user = new User(stack, 'MyUser');
		database.grantConnect(user);

		const template = Template.fromStack(stack);
		template.resourceCountIs('AWS::IAM::Policy', 1);

		const [firstPolicy] = Object.values(
			template.findResources('AWS::IAM::Policy'),
		);

		expect(firstPolicy).toMatchInlineSnapshot(`
		{
		  "Properties": {
		    "PolicyDocument": {
		      "Statement": [
		        {
		          "Action": "rds-db:connect",
		          "Effect": "Allow",
		          "Resource": {
		            "Fn::Join": [
		              "",
		              [
		                "arn:",
		                {
		                  "Ref": "AWS::Partition",
		                },
		                ":rds-db:",
		                {
		                  "Ref": "AWS::Region",
		                },
		                ":",
		                {
		                  "Ref": "AWS::AccountId",
		                },
		                ":dbuser:",
		                {
		                  "Fn::GetAtt": [
		                    "testCloudqueryC806EA2D",
		                    "DbiResourceId",
		                  ],
		                },
		                "/{{resolve:secretsmanager:",
		                {
		                  "Ref": "testCloudquerySecretAttachmentA5056ECE",
		                },
		                ":SecretString:username::}}",
		              ],
		            ],
		          },
		        },
		      ],
		      "Version": "2012-10-17",
		    },
		    "PolicyName": "MyUserDefaultPolicy7B897426",
		    "Users": [
		      {
		        "Ref": "MyUserDC45028B",
		      },
		    ],
		  },
		  "Type": "AWS::IAM::Policy",
		}
	`);
	});
});
