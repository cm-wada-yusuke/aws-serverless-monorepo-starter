import * as path from 'path';

export const NODE_LAMBDA_SRC_DIR = path.join(
    process.cwd(),
    '../app-node/dist/src',
);
export const NODE_LAMBDA_LAYER_DIR = path.join(
    process.cwd(),
    '../app-node/dist/layer',
);
