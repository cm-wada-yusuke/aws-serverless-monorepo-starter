import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as lambda from '@aws-cdk/aws-lambda';
import { Tracing } from '@aws-cdk/aws-lambda';
import * as appsync from '@aws-cdk/aws-appsync';
import {
    AuthorizationType,
    FieldLogLevel,
    MappingTemplate,
    PrimaryKey,
    Values,
} from '@aws-cdk/aws-appsync';
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
        tracing: Tracing.ACTIVE,
    });

    const graphApi = new appsync.GraphqlApi(stack, 'GreetingBff', {
        name: global.getGraphApiName('GreetingBff'),
        logConfig: {
            excludeVerboseContent: false,
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

    /**
     * Greeting Template DynamoDB
     */
    const templateTable = new dynamo.Table(stack, 'TemplateTable', {
        tableName: global.getTableName('Template'),
        partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // DynamoDB DataSource
    const ddbSource = graphApi.addDynamoDbDataSource(
        'TemplateTableDataSource',
        templateTable,
    );
    ddbSource.createResolver({
        typeName: 'Mutation',
        fieldName: 'createTemplate',
        requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
            PrimaryKey.partition('id').auto(),
            Values.projecting('input'),
        ),
        responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    const helloMachine = sfn.StateMachine.fromStateMachineArn(
        stack,
        'HelloMachine',
        'arn:aws:states:ap-northeast-1:945068354201:stateMachine:Helloworld',
    );

    const stepFunctionsDatasource = graphApi.addHttpDataSource(
        'StepFunctions',
        'https://states.ap-northeast-1.amazonaws.com',
        {
            name: 'StepFunctionsDataSource',
            authorizationConfig: {
                signingRegion: 'ap-northeast-1',
                signingServiceName: 'states',
            },
        },
    );

    helloMachine.grantRead(stepFunctionsDatasource);

    stepFunctionsDatasource.createResolver({
        typeName: 'Query',
        fieldName: 'getHelloWorldStatus',
        requestMappingTemplate: MappingTemplate.fromString(`
{
  "version": "2018-05-29",
  "method": "POST",
  "resourcePath": "/",
  "params": {
    "headers": {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target":"AWSStepFunctions.DescribeExecution"
    },
    "body": {
      "executionArn": "$ctx.arguments.executionArn"
    }
  }
}
`),
        responseMappingTemplate: MappingTemplate.fromString(`
## Raise a GraphQL field error in case of a datasource invocation error
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end
## if the response status code is not 200, then return an error. Else return the body **
#if($ctx.result.statusCode == 200)
    ## If response is 200, return the body.
    $ctx.result.body
#else
    ## If response is not 200, append the response to error block.
    $utils.appendError($ctx.result.body, "$ctx.result.statusCode")
#end
`),
    });

    return stack;
}
