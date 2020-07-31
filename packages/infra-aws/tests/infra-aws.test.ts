import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { greetingServiceApplicationStack } from '../lib/greeting-service-stack';

test('Empty Stack', async () => {
    const app = new cdk.App();
    // WHEN
    const stack = await greetingServiceApplicationStack(app, 'TestStack');
    // THEN
    expectCDK(stack).to(
        haveResource('AWS::Lambda::Function', {
            Runtime: 'nodejs12.x',
        }),
    );
});
