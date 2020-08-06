import { TsasParameterManager } from 'tsas-cdk';

import * as path from 'path';

export const NODE_LAMBDA_SRC_DIR = path.join(
    process.cwd(),
    '../app-node/dist/src',
);
export const NODE_LAMBDA_LAYER_DIR = path.join(
    process.cwd(),
    '../app-node/dist/layer',
);

export class GlobalProps {
    stage: Stage;
    division: Division;
    pm: TsasParameterManager;
    version: string;

    constructor(
        stage: Stage,
        division: Division,
        pm: TsasParameterManager,
        version: string,
    ) {
        this.stage = stage;
        this.division = division;
        this.pm = pm;
        this.version = version;
    }

    getDefaultAppRegion(): string {
        return this.pm.region;
    }

    getApiName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-api`;
    }

    getGraphApiName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-graph`;
    }

    getLayerVersionName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-layer-version`;
    }

    getFunctionName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-function`;
    }

    getStreamName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-stream`;
    }

    getBucketName(id: string, accountId: string, regionName?: string): string {
        const region = regionName ?? this.pm.region;
        return `${this.stage}-${this.pm.appName}-${id}-bucket-${region}-${accountId}`;
    }

    getStackName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}`;
    }

    getRuleName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-rule`;
    }

    getPipelineName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-pipeline`;
    }

    getBuildProjectName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-build`;
    }

    getRoleName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-role`;
    }

    getTableName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-table`;
    }

    getStateMachineName(id: string): string {
        return `${this.stage}-${this.pm.appName}-${id}-machine`;
    }

    getGlueDatabaseName(id: string): string {
        return `${this.stage}_${id}_db`;
    }
}

export type Stage = 'dev' | 'stg' | 'prd';
export type Division = 'app' | 'e2e';
export type DeployApproval = 'required' | 'never';
