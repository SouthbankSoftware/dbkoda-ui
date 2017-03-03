/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-03T11:35:04+11:00
*/

import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import App from '../App';

describe('<App />', () => {
  it ('should have a sidePanel',() => {
    const wrapper = shallow(<App />);
    assert(wrapper.find('.sidePanel').exists());
  });

  it ('should have an editorPanel', () => {
    const wrapper = shallow(<App />);
    assert(wrapper.find('.editorPanel').exists());
  });
});
