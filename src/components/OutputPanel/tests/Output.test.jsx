/**
* @Author: chris
* @Date:   2017-03-10T10:55:54+11:00
* @Email:  chris@southbanksoftware.com
* @Last modified by:   chris
* @Last modified time: 2017-03-10T15:15:06+11:00
*/



import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import OutputPanel from '../Panel';
import Toolbar from '../Toolbar';

describe('<OutputPanel />', () => {
  it ('should exist', () => {
    const wrapper = shallow(<OutputPanel.wrappedComponent output={{}} />);
    assert(wrapper.find('.outputPanel').exists());
  });

  it ('can be updated programmatically');
  it ('cannot be updated by the user');
  it ('should be clearable');

});

describe('<Editor />', () => {
  it ('updates contents when output is changed');
  it ('clears contents when output is cleared');
});

describe('<Toolbar />', () => {
  it ('should have a disabled showMoreBtn when canShowMore is false', () => {
    const wrapper = shallow(<Toolbar.wrappedComponent output={{ output:"", canShowMore:false }} />);
    const showMoreBtnState = wrapper.find('.showMoreBtn').prop('disabled');
    assert.equal(showMoreBtnState, 'disabled');
  });

  it ('should have an enabled showMoreBtn when canShowMore is true', () => {
    const wrapper = shallow(<Toolbar.wrappedComponent output={{ output:"", canShowMore:true }} />);
    assert(!wrapper.find('.showMoreBtn').prop('disabled'));
  });

  it ('should have a clearOutputBtn', () => {
    const wrapper = shallow(<Toolbar.wrappedComponent output={{ output:"", canShowMore:false }} />);
    assert(wrapper.find('.clearOutputBtn'));
  });
});
