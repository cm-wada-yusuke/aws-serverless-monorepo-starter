import { handler } from '../../../../../../src/lambda/handlers/appsync/greeting/get-greeting-reply-handler';

describe('test handler', (): void => {
    test('test handler response', async (): Promise<void> => {
        const response = await handler({
            arguments: {
                input: {
                    message: 'unit test greet',
                },
            },
        });
        expect(response.reply).toBe('Fine, and you? > unit test greet');
    });
});
