import * as cdk from '@aws-cdk/core';
import { RemovalPolicy, Stack } from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import { AttributeType, ProjectionType } from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import { GlobalProps } from './global-props';

export async function blogServiceApplicationStack(
    scope: cdk.Construct,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: global.getStackName(id),
    });

    const articleTable = new dynamo.Table(stack, 'ArticleTable', {
        tableName: global.getTableName('Article'),
        partitionKey: { name: 'id', type: AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
    });
    articleTable.addGlobalSecondaryIndex({
        indexName: 'slug-createAt-index',
        partitionKey: { name: 'slug', type: AttributeType.STRING },
        projectionType: ProjectionType.ALL,
    });

    // for AppRunner
    new iam.Role(stack, global.getRoleName('BlogServer'), {
        assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName(
                'AmazonDynamoDBFullAccess',
            ),
        ],
    });

    // App Runner does not support CDK yet, please handmade:)

    return stack;
}
