#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { greetingServiceApplicationStack } from '../lib/greeting-service-stack';
import { greetingDeployPipelineStack } from '../lib/pipeline-deploy-stack';

async function buildApp(): Promise<void> {
    const app = new cdk.App();

    // Application stack
    await greetingServiceApplicationStack(app, 'GreetingServiceStack');

    // Deploy stack
    await greetingDeployPipelineStack(app, 'DeployStack');
}

buildApp();
