import * as cdk from '@aws-cdk/core';
import { Construct, RemovalPolicy, Stack } from '@aws-cdk/core';
import * as codePipeline from '@aws-cdk/aws-codepipeline';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as codeBuild from '@aws-cdk/aws-codebuild';
import { LinuxBuildImage } from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { DeployApproval, GlobalProps } from './global-props';

export async function greetingDeployPipelineStack(
    scope: Construct,
    id: string,
    global: GlobalProps,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: global.getStackName(id), // dev-ApplicationDeploy-stack
    });

    // call parameter store
    const params = await global.pm.load();
    const deployAppApproval = params.DeployApproval
        ? (params.DeployApproval.Value as DeployApproval)
        : 'required';

    // artifact bucket
    const deployBucket = new s3.Bucket(stack, 'deploy', {
        encryption: s3.BucketEncryption.KMS,
        bucketName: global.getBucketName('deploy', stack.region, stack.account),
        versioned: false,
        removalPolicy: RemovalPolicy.DESTROY,
    });

    const appOutput = new codePipeline.Artifact();
    const gitHubToken = cdk.SecretValue.secretsManager('GitHubToken');
    const sourceAction = new actions.GitHubSourceAction({
        actionName: 'GitHubSourceAction',
        owner: 'cm-wada-yusuke',
        oauthToken: gitHubToken,
        repo: 'aws-serverless-monorepo-starter',
        branch: 'master',
        output: appOutput,
        runOrder: 1,
    });

    const approvalAction = new actions.ManualApprovalAction({
        actionName: 'DeployApprovalAction',
        runOrder: 2,
        externalEntityLink: sourceAction.variables.commitUrl,
    });

    const deployRole = new iam.Role(stack, 'CodeBuildDeployRole', {
        assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
        managedPolicies: [
            {
                managedPolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
            },
        ],
    });
    const applicationBuild = new codeBuild.PipelineProject(
        stack,
        'GreetingApplicationDeploy-project',
        {
            projectName: 'GreetinApplicationDeploy-project',
            buildSpec: codeBuild.BuildSpec.fromSourceFilename(
                './buildspec/buildspec-deploy.yml',
            ),
            role: deployRole,
            environment: {
                buildImage: LinuxBuildImage.STANDARD_3_0,
                environmentVariables: {
                    AWS_DEFAULT_REGION: {
                        type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value: stack.region,
                    },
                },
            },
        },
    );

    const applicationDeployAction = new actions.CodeBuildAction({
        actionName: 'GreetingApplicationDeployAction',
        project: applicationBuild,
        input: appOutput,
        runOrder: 3,
    });

    const pipeline = new Pipeline(stack, 'GreetingApplicationDeploy', {
        pipelineName: global.getPipelineName('GreetingApplicationDeploy'),
        artifactBucket: deployBucket,
    });

    pipeline.addStage({
        stageName: 'GitHubSourceAction-stage',
        actions: [sourceAction],
    });

    const deployStage: codePipeline.IAction[] = [applicationDeployAction];

    if (deployAppApproval === 'required') {
        deployStage.unshift(approvalAction);
    }

    pipeline.addStage({
        stageName: 'YenqBackendApplicationDeploy-stage',
        actions: deployStage,
    });

    return stack;
}
