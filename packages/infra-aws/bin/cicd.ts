#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { greetingDeployPipelineStack } from '../lib/pipeline-deploy-stack';
import { getGlobal } from './common';

async function buildApp(): Promise<void> {
    const app = new cdk.App();
    const glboal = getGlobal(app);

    // Deploy stack
    await greetingDeployPipelineStack(app, 'ApplicationDeployStack', glboal);
}

buildApp();
