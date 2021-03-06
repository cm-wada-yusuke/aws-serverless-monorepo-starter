#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { greetingServiceApplicationStack } from '../lib/greeting-service-stack';
import { getGlobal } from './common';

async function buildApp(): Promise<void> {
    const app = new cdk.App();
    const global = getGlobal(app);

    // Application stack
    await greetingServiceApplicationStack(app, 'GreetingServiceStack', global);
}

buildApp();
