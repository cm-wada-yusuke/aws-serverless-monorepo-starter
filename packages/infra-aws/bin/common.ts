#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as tsasCdk from 'tsas-cdk';
import { Division, GlobalProps, Stage } from '../lib/global-props';

export function getGlobal(app: cdk.App): GlobalProps {
    const stage: Stage =
        app.node.tryGetContext('stage') ?? process.env.STAGE ?? 'dev';
    const division: Division = app.node.tryGetContext('division') ?? 'app';

    // load from ssm
    const pm = new tsasCdk.TsasParameterManager(stage, division);

    // load package.json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pjson = require('../package.json');

    return new GlobalProps(stage, division, pm, pjson.version);
}
