import * as cdk from '@aws-cdk/core';
import { CfnOutput, Stack } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync';
import { AuthorizationType, SchemaDefinition } from '@aws-cdk/aws-appsync';
import {
    GlobalProps,
    NODE_LAMBDA_LAYER_DIR,
    NODE_LAMBDA_SRC_DIR,
} from './global-props';

export async function greetingServiceApplicationStack(
    scope: cdk.Construct,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: global.getStackName(id),
    });

    // node_modules LayerVersion
    const nodeModulesLayer = new lambda.LayerVersion(
        stack,
        'NodeModulesLayer',
        {
            layerVersionName: 'NodeModulesLayer',
            code: lambda.Code.fromAsset(NODE_LAMBDA_LAYER_DIR),
            description: 'Node.js modules layer',
            compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
        },
    );

    const greetingFn = new lambda.Function(stack, 'getGreetingReply', {
        functionName: 'getGreetingReply-function',
        code: lambda.Code.fromAsset(NODE_LAMBDA_SRC_DIR),
        handler:
            'lambda/handlers/api-gw/greeting/api-gw-get-greeting-reply-handler.handler',
        runtime: lambda.Runtime.NODEJS_12_X,
        layers: [nodeModulesLayer],
        environment: {
            REGION: cdk.Stack.of(stack).region,
        },
    });

    const graphApi = new appsync.GraphQLApi(stack, 'GreetingBff', {
        name: global.getGraphApiName('GreetingBff'),
        authorizationConfig: {
            defaultAuthorization: {
                authorizationType: AuthorizationType.API_KEY,
            },
        },
        schemaDefinition: SchemaDefinition.CODE,
    });

    graphApi.updateDefinition(`
input Message {
    message: String!
}

type Query {
    getReply(input: Message): Reply!
}

type Reply {
    reply: String!
}
 `);

    // Lambda Function Datasource
    const greetingFnDataSource = graphApi.addLambdaDataSource(
        'greetingFnDataSource',
        'greetingFnDataSource',
        greetingFn,
    );

    /**
     * Lambda Direct Resolvers
     */
    greetingFnDataSource.createResolver({
        typeName: 'Query',
        fieldName: 'getReply',
    });

    new CfnOutput(stack, 'GreetingFunctionArn', {
        exportName: 'GreetingFunctionArn',
        value: greetingFn.functionArn,
    });

    return stack;
}
