import * as tsasCdk from 'tsas-cdk';
import * as session from './session';

module.exports = async () => {
    console.log('setup');

    const stage = process.env.STAGE || 'dev';
    const region = process.env.AWS_REGION || 'ap-northeast-1';
    process.env.AWS_REGION = region;

    console.log('Target Env:', stage);
    console.log('Target Region:', region);
    const manager = new tsasCdk.TsasParameterManager(stage, 'e2e');
    const params = await manager.load();
    session.write('TsasParameterManager', params);
    console.log(session.TMP_PATH, params);
    console.log('setup');
};
