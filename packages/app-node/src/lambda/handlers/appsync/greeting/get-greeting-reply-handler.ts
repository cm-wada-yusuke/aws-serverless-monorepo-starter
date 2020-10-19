import { LambdaContext } from '../../lambda-context';

/**
 * API Gateway handler
 * @param event input event
 * @param context response data
 */
export async function handler(
    event: AppSyncPassThroughInput,
    context?: LambdaContext,
): Promise<GreetingResponse> {
    console.info('event', JSON.stringify(event));
    console.info('context', JSON.stringify(context?.awsRequestId));

    return {
        reply: `Fine, and you? > ${event.arguments.input.message}`,
    };
}

type AppSyncPassThroughInput = {
    arguments: {
        input: GreetingEvent;
    };
};

type GreetingEvent = {
    message: string;
};

type GreetingResponse = {
    reply: string;
};
