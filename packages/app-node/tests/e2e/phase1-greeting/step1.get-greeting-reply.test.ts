import * as aws from 'aws-sdk';
import * as tsasCdk from 'tsas-cdk';
import * as session from '../session';

jest.setTimeout(10000);
describe('lambda invoke test', () => {
    let ssm: tsasCdk.TsasParameters;
    let arn: string;
    let region: string;

    beforeAll(async () => {
        ssm = session.read('TsasParameterManager') as tsasCdk.TsasParameters;
        arn = ssm.GetGreetingReplyFnArn.Value;
        region = process.env.AWS_REGION!;
        console.info('GetGreetingReplyFnArn', arn);
    });

    describe('success: greeting function invoke', () => {
        test('greeting function returns reply response', async () => {
            const event = {
                arguments: {
                    input: {
                        message: 'How are you?',
                    },
                },
            };

            const client = new aws.Lambda({
                region,
            });
            const response = await client
                .invoke({
                    FunctionName: arn,
                    InvocationType: 'RequestResponse',
                    Payload: JSON.stringify(event),
                })
                .promise();
            expect(response.StatusCode).toEqual(200);
            expect(JSON.parse(response.Payload as string)).toEqual({
                reply: 'Fine, and you? > How are you?',
            });
        });
    });
});
