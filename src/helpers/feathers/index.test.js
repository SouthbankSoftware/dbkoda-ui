import {assert} from 'chai';
import {featherClient} from './index';

describe('test feathers client', () => {
  it('should register a listener', () => {
    featherClient().addOutputListener(1, 2, 'test1');
    let output = featherClient().getShellOutputListeners(1, 2);
    assert.equal(output.length, 1);
    assert.equal(output[0].listeners.length, 1);
    assert.equal(output[0].listeners[0], 'test1');

    featherClient().addOutputListener(1, 2, 'test2');
    output = featherClient().getShellOutputListeners(1, 2);
    assert.equal(output.length, 1);
    assert.equal(output[0].listeners.length, 2);

    featherClient().removeOutputListener(1, 2, 'test1');
    output = featherClient().getShellOutputListeners(1, 2);
    assert.equal(output.length, 1);
    assert.equal(output[0].listeners.length, 1);
    assert.equal(output[0].listeners[0], 'test2');


  });
});
