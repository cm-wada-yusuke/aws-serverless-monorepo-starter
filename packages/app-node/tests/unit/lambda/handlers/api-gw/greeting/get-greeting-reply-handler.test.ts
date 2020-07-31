import { handler } from '../../../../../../src/lambda/handlers/api-gw/greeting/api-gw-get-greeting-reply-handler';

describe('test handler', (): void => {
    test('test handler response', async (): Promise<void> => {
        const response = await handler({
            message: 'unit test greet',
        });
        expect(response.reply).toBe('Fine, and you? > unit test greet');
    });
});
