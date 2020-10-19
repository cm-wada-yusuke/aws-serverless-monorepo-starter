AWS Serverless application (TypeScript) project starter
===

[yarn workspace](https://classic.yarnpkg.com/en/docs/cli/workspace) based AWS CDK and Lambda Function project template. 

* Node.js (12.x)

Monorepo contains following workspaces...
---

* app-node: Lambda Function (TypeScript) 
* infra-aws: AWS CDK infra (TypeScript) 
* site-react: React SPA  


Getting Started
---

### Server

First, you should to switch aws account on your terminal app.

Using:

* https://github.com/remind101/assume-role
* https://github.com/cm-wada-yusuke/aws_swrole


and go deploy *greeting server application*:

```bash
yarn workspace infra-aws cdk bootstrap ###first use of aws cdk, in your aws account.
yarn deploy
```

You can invoke greeting function after deploy.

```bash
aws lambda invoke \
--payload '{"message": "Hi, how do you feel?"}' \
--function-name <greeting function arn> \
--cli-binary-format raw-in-base64-out \
out.txt
``` 


Example: 

```bash
aws lambda invoke \
--payload '{"message": "Hi, how do you feel?"}' \
--function-name 'arn:aws:lambda:ap-northeast-1:12345667890:function:getGreetingReply-function' \
--cli-binary-format raw-in-base64-out \
out.txt

less out.txt

{"reply":"Fine, and you? > Hi, how do you feel?"}⏎
``` 



### AppSync GraphQL

You can request greeting GraphQL API via AWS Console GraphiQL.


![aws_console_appsync.png](./aws_console_appsync.png)


### React App

Create React App and setup apollo client. We recommend set up your React application by yourself. Following are our examples.


### Rename 

Finally, rename your application.

* package.json

```diff
-  "name": "template-aws-cdk-typescript-serverless-app",
+  "name": "good-health",
  "version": "0.1.0",
```


* tsas-cdk.json

This name uses generate aws resource name, for instance, when `appName` is `greeting-service`, its Lambda Function's name: `${env}-greeting-service-${FunctionName}-function`.
 

```diff
{
-  "appName": "greeting-service",
+  "appName": "goot-health",
  "region": "ap-northeast-1"
}
```  


then, next deploy rename function to `${env}-greeting-service-${FunctionName}-function`.

