import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as glue from '@aws-cdk/aws-glue';
import { GlobalProps } from './global-props';

export async function greetingServiceApplicationStack(
    scope: cdk.Construct,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: global.getStackName(id),
    });

    /**
     * S3 for Dynamodb Export
     */
    const exportBucket = new s3.Bucket(stack, 'export', {
        bucketName: global.getBucketName(
            'export',
            stack.account,
            global.getDefaultAppRegion(),
        ),
    });

    /**
     * Greeting Template DynamoDB
     */
    new dynamo.Table(stack, 'TemplateTable', {
        tableName: global.getTableName('Template'),
        partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    const db = new glue.Database(stack, 'GreetingDatabase', {
        databaseName: global.getGlueDatabaseName('greeting'),
    });
    new glue.Table(stack, 'TemplateGlueTable', {
        database: db,
        tableName: 'template',
        bucket: exportBucket,
        s3Prefix:
            'dev-greeting-service-Template-table/AWSDynamoDB/01604986918444-1c619ce8/data/',
        dataFormat: glue.DataFormat.JSON,
        columns: [
            {
                name: 'Item',
                type: glue.Schema.struct([
                    {
                        name: 'id',
                        type: glue.Schema.struct([
                            {
                                name: 'S',
                                type: glue.Schema.STRING,
                            },
                        ]),
                    },
                    {
                        name: 'message',
                        type: glue.Schema.struct([
                            {
                                name: 'S',
                                type: glue.Schema.STRING,
                            },
                        ]),
                    },
                    {
                        name: 'usedTimes',
                        type: glue.Schema.struct([
                            {
                                name: 'N',
                                type: glue.Schema.INTEGER,
                            },
                        ]),
                    },
                ]),
            },
        ],
    });

    return stack;
}
