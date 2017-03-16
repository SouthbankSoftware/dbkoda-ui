/**
* @Author: chris
* @Date:   2017-03-10T10:55:54+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-03-16T17:32:47+11:00
*/

import React from 'react';
import { assert } from 'chai';
import { shallow, mount } from 'enzyme';
import { useStrict } from 'mobx';
import { OutputToolbar, OutputEditor, OutputPanel } from '../index.js';
import Store from '~/stores/global';

describe('Output Panel', () => {
  let app;

  beforeAll(() => {
    useStrict(true);
    const store = new Store();
    store.output.output = "Some output";
    app = shallow(<OutputPanel.wrappedComponent store={store} />);
  });

  test ('should exist', () => {
    assert(app.find('.outputPanel').exists());
  });

  test ('can be updated programmatically');
  test ('cannot be updated by the user');
  test ('should be clearable');
});

describe('Output Editor', () => {
  test ('updates contents to reflect output', () => {
    const wrapper = mount(<OutputEditor.wrappedComponent
      output={{output: "Test Output", cannotShowMore: true}} />);

  });
  test ('clears contents when output is cleared');
});

describe('Output Toolbar', () => {
  test ('should have an enabled showMoreBtn when cannotShowMore is false', () => {
    const wrapper = shallow(<OutputToolbar.wrappedComponent
      store={{output:{ output:"", cannotShowMore:false }}} />);
    assert(!wrapper.find('.showMoreBtn').prop('disabled'));
  });

  test ('should have a disabled showMoreBtn when cannotShowMore is true', () => {
    const wrapper = shallow(<OutputToolbar.wrappedComponent
      store={{output:{ output:"", cannotShowMore:true }}} />);
    assert(wrapper.find('.showMoreBtn').prop('disabled'));
  });

  test ('should have a clearOutputBtn', () => {
    const wrapper = shallow(<OutputToolbar.wrappedComponent
      store={{output:{ output:"", cannotShowMore:false }}} />);
    assert(wrapper.find('.clearOutputBtn'));
  });
});
