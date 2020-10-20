import * as cdk from '@aws-cdk/core';
import { CfnOutput, Stack } from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';
import * as lambda from '@aws-cdk/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync';
import { AuthorizationType, FieldLogLevel } from '@aws-cdk/aws-appsync';
import {
    GlobalProps,
    NODE_LAMBDA_LAYER_DIR,
    NODE_LAMBDA_SRC_DIR,
} from './global-props';
import * as path from 'path';

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

    const greetingFn = new lambda.Function(stack, 'GetGreetingReply', {
        functionName: global.getFunctionName('GetGreetingReply'),
        code: lambda.Code.fromAsset(NODE_LAMBDA_SRC_DIR),
        handler:
            'lambda/handlers/appsync/greeting/get-greeting-reply-handler.handler',
        runtime: lambda.Runtime.NODEJS_12_X,
        layers: [nodeModulesLayer],
        environment: {
            REGION: cdk.Stack.of(stack).region,
        },
    });

    const graphApi = new appsync.GraphqlApi(stack, 'GreetingBff', {
        name: global.getGraphApiName('GreetingBff'),
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
    const greetingFnDataSource = graphApi.addLambdaDataSource(
        'GreetingFnDataSource',
        greetingFn,
    );

    /**
     * Lambda Direct Resolvers
     */
    greetingFnDataSource.createResolver({
        typeName: 'Query',
        fieldName: 'getReply',
    });

    new ssm.StringParameter(stack, 'GetGreetingReplyFnArn', {
        stringValue: greetingFn.functionArn,
        parameterName: global.pm.fullKeyOf('GetGreetingReplyFnArn', 'e2e'),
    });

    new ssm.StringParameter(stack, 'GreetingGraphApiEndpoint', {
        stringValue: graphApi.graphqlUrl,
        parameterName: global.pm.fullKeyOf('GreetingGraphApiEndpoint'),
    });

    new CfnOutput(stack, 'GreetingFunctionArn', {
        exportName: 'GreetingFunctionArn',
        value: greetingFn.functionArn,
    });

    new CfnOutput(stack, 'GreetingGraphApiEndpointOutput', {
        exportName: 'GreetingGraphApiEndpointOutput',
        value: graphApi.graphqlUrl,
    });

    return stack;
}
