import * as aws from 'aws-sdk';

jest.setTimeout(10000);
describe('lambda invoke test', () => {
    describe('success: greeting function invoke', () => {
        test('greeting api returns reply response', async () => {
            const event = {
                message: 'How are you?',
            };

            const client = new aws.Lambda({
                region: 'ap-northeast-1',
            });
            const response = await client
                .invoke({
                    FunctionName: 'getGreetingReply-function',
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
