import * as cdk from '@aws-cdk/core';
import { CfnOutput, Stack } from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import * as appsync from '@aws-cdk/aws-appsync';
import {
    AuthorizationType,
    FieldLogLevel,
    MappingTemplate,
} from '@aws-cdk/aws-appsync';
import { GlobalProps } from './global-props';
import * as path from 'path';
import { updateItemMappingTemplate } from './update-item-template';

export async function greetingServiceApplicationStack(
    scope: cdk.Construct,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: global.getStackName(id),
    });

    const entryTable = new dynamodb.Table(scope, 'EntryTable', {
        tableName: global.getTableName('Entry'),
        billingMode: BillingMode.PROVISIONED,
        readCapacity: 1,
        writeCapacity: 1,
        partitionKey: {
            type: AttributeType.STRING,
            name: 'id',
        },
    });

    const graphApi = new appsync.GraphqlApi(stack, 'EntryBff', {
        name: global.getGraphApiName('EntryBff'),
        logConfig: {
            excludeVerboseContent: true,
            fieldLogLevel: FieldLogLevel.ALL,
        },
        authorizationConfig: {
            defaultAuthorization: {
                authorizationType: AuthorizationType.API_KEY,
            },
            additionalAuthorizationModes: [],
        },
        schema: appsync.Schema.fromAsset(
            path.join(__dirname, 'schema.graphql'),
        ),
        xrayEnabled: true,
    });

    // Lambda Function Datasource
    // const greetingFnDataSource = graphApi.addLambdaDataSource(
    const entryTableDataSource = graphApi.addDynamoDbDataSource(
        'EntryTableDataSource',
        entryTable,
    );

    /**
     * DynamoDB Resolvers
     */
    entryTableDataSource.createResolver({
        typeName: 'Query',
        fieldName: 'getEntry',
        requestMappingTemplate: MappingTemplate.dynamoDbGetItem('id', 'userId'),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    entryTableDataSource.createResolver({
        typeName: 'Mutation',
        fieldName: 'updateEntry',
        requestMappingTemplate: MappingTemplate.fromString(
            updateItemMappingTemplate({
                partitionKey: {
                    keyName: 'id',
                    attributePath: 'userId',
                },
                version: {
                    keyName: 'updateAt',
                    attributePath: 'lastUpdateAt',
                },
                inputPath: 'input',
            }),
        ),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    new ssm.StringParameter(stack, 'EntryGraphApiEndpoint', {
        stringValue: graphApi.graphqlUrl,
        parameterName: global.pm.fullKeyOf('EntryGraphApiEndpoint'),
    });

    new CfnOutput(stack, 'EntryGraphApiEndpointOutput', {
        exportName: 'EntryGraphApiEndpointOutput',
        value: graphApi.graphqlUrl,
    });

    return stack;
}
