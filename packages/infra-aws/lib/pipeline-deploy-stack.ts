import * as cdk from '@aws-cdk/core';
import { Construct, Stack } from '@aws-cdk/core';
import * as codePipeline from '@aws-cdk/aws-codepipeline';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as codeBuild from '@aws-cdk/aws-codebuild';
import { LinuxBuildImage } from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';

export async function greetingDeployPipelineStack(
    scope: Construct,
    id: string,
): Promise<Stack> {
    const stack = new cdk.Stack(scope, id, {
        stackName: 'DeployStack',
    });

    const appOutput = new codePipeline.Artifact();
    const gitHubToken = cdk.SecretValue.secretsManager('GitHubToken');
    const sourceAction = new actions.GitHubSourceAction({
        actionName: 'GitHubSourceAction',
        owner: 'cm-wada-yusuke',
        oauthToken: gitHubToken,
        repo: 'template-aws-cdk-typescript-serverless-app',
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

    const pipeline = new Pipeline(stack, 'GreetingApplicationDeploy-pipeline', {
        pipelineName: 'GreetingApplicationDeploy-pipeline',
    });

    pipeline.addStage({
        stageName: 'GitHubSourceAction-stage',
        actions: [sourceAction],
    });

    pipeline.addStage({
        stageName: 'GreetingApplicationDeploy-stage',
        actions: [approvalAction, applicationDeployAction],
    });

    return stack;
}
