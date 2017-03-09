import {assert} from 'chai';
import {featherClient} from './index';

describe('test feathers client', () => {
  it('should register a listener', () => {
    featherClient().addOutputListener(1, 2, 'test');
    const listeners = featherClient().getShellOutputListeners(1, 2);
    assert.equal(listeners.length, 1);
    assert.equal(listeners[0].listeners.length, 1);
    assert.equal(listeners[0].listeners[0], 'test');
  });
});
