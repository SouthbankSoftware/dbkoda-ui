import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';
import {EditorPanel} from '../index.js';

describe('<EditorPanel />', () => {
  it('should have a toolbar', () => {
    const wrapper = shallow(<EditorPanel />);
    assert(wrapper.find('.editorToolBar').exists());
  });

  it('should have a tabview', () => {
    const wrapper = shallow(<EditorPanel />);
    assert(wrapper.find('.editorTabView').exists());
  });

  it('show have at least one codemirror instance', () => {
    const wrapper = shallow(<EditorPanel />);
    assert(wrapper.find('.CodeMirror-scroll').exists());
  });

  it('should be able to create new editors', () => {

  });
});
