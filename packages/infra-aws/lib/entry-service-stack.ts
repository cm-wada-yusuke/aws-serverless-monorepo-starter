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
    PrimaryKey,
    Values,
} from '@aws-cdk/aws-appsync';
import { GlobalProps } from './global-props';
import * as path from 'path';

export async function greetingServiceApplicationStack(
    app: cdk.App,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(app, id, {
        stackName: global.getStackName(id),
    });

    const entryQueueTable = new dynamodb.Table(stack, 'EntryQueueTable', {
        tableName: global.getTableName('EntryQueue'),
        billingMode: BillingMode.PROVISIONED,
        readCapacity: 1,
        writeCapacity: 1,
        partitionKey: {
            type: AttributeType.STRING,
            name: 'id',
        },
    });
    entryQueueTable.addGlobalSecondaryIndex({
        indexName: 'inFlight-entryAtMillis-index',
        partitionKey: {
            type: AttributeType.NUMBER,
            name: 'inFlight',
        },
        sortKey: {
            type: AttributeType.NUMBER,
            name: 'entryAtMillis',
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

    const entryTableDataSource = graphApi.addDynamoDbDataSource(
        'EntryTableDataSource',
        entryQueueTable,
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
        fieldName: 'putEntry',
        requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
            PrimaryKey.partition('id').is('userId'),
            Values.projecting('input'),
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
