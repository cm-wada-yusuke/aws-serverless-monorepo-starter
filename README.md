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




### React 

