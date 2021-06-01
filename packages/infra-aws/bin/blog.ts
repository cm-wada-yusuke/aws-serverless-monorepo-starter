#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { getGlobal } from './common';
import { blogServiceApplicationStack } from '../lib/blog-service-stack';

async function buildApp(): Promise<void> {
    const app = new cdk.App();
    const global = getGlobal(app);

    // Application stack
    await blogServiceApplicationStack(app, 'BlogServiceStack', global);
}

buildApp();
