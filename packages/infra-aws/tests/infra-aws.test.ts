import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { greetingServiceApplicationStack } from '../lib/entry-service-stack';
import { getGlobal } from '../bin/common';

test('Empty Stack', async () => {
    const app = new cdk.App();
    const global = getGlobal(app);
    // WHEN
    const stack = await greetingServiceApplicationStack(
        app,
        'TestStack',
        global,
    );
    // THEN
    expectCDK(stack).to(
        haveResource('AWS::Lambda::Function', {
            Runtime: 'nodejs12.x',
        }),
    );
});
