import * as os from 'os';
import * as fs from 'fs';

const TMP_DIR = os.tmpdir();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TMP_NAME = require('../../package.json').name;
export const TMP_PATH = `${TMP_DIR}/${TMP_NAME}`;
const FORMAT = 'utf8';

export function write(key: string, value: any): void {
    if (fs.existsSync(TMP_PATH)) {
        const input = fs.readFileSync(TMP_PATH, FORMAT);
        const data = JSON.parse(input);
        data[key] = value;
        const output = JSON.stringify(data);
        fs.writeFileSync(TMP_PATH, output);
    } else {
        const data = { [key]: value };
        const output = JSON.stringify(data);
        fs.writeFileSync(TMP_PATH, output);
    }
}

export function read(key: string): any {
    const input = fs.readFileSync(TMP_PATH, FORMAT);
    const data = JSON.parse(input);
    return data[key];
}

export function clear(key: string): void {
    const input = fs.readFileSync(TMP_PATH, FORMAT);
    const data = JSON.parse(input);
    delete data[key];
    const output = JSON.stringify(data);
    fs.writeFileSync(TMP_PATH, output);
}

export function clearAll(): void {
    if (fs.existsSync(TMP_PATH)) {
        fs.unlinkSync(TMP_PATH);
    }
}
