import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import OutputPanel from '../OutputPanel';

describe('<OutputPanel />', () => {
  it ('should have a code mirror instance', () => {
    const wrapper = shallow(<OutputPanel />);
    assert(wrapper.find('.outputPanel').exists());
  });

  it ('can be updated programmatically');
  it ('cannot be updated by the user');
  it ('should be clearable');
});
