const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    sort(tests) {
        const copyTests = Array.from(tests);
        return copyTests.sort((testA, testB) =>
            testA.path > testB.path ? 1 : -1,
        );
    }
}

module.exports = CustomSequencer;
