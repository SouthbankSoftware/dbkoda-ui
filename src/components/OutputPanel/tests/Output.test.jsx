/**
* @Author: chris
* @Date:   2017-03-10T10:55:54+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-04-11T14:01:42+10:00
*/
import ReactDOM from 'react-dom';
import { assert, expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import renderer from 'react-test-renderer';
import { OutputToolbar, OutputEditor, OutputPanel } from '../index.js';
import Store from '~/stores/global';
var jsdom = require("jsdom").jsdom;
let React = require('react');

describe('Output Toolbar', () => {
  let document;
  let window;
  let store;
  let OutputToolbarWrapper = function OutputToolbarWrapper(props) {
    return (<Provider store={props.store}><OutputToolbar title="Test" /></Provider>);
  }

  beforeAll(() => {
    document = jsdom('<div id="container"></div>');
    window = document.defaultView;
    store = new Store();
  });

  beforeEach(() => {
    store.outputs.set('Test', {
      id: 1,
      title: 'Test',
      output: '',
      cannotShowMore: true,
      showingMore: false
    });
    store.outputPanel.currentTab = 'Test';
  });

  test('should have an enabled showMoreBtn when cannotShowMore is false', () => {
    store.outputs.get('Test').cannotShowMore = false;
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    let paragraph = document.querySelector('.showMoreBtn');
    assert(!document.querySelector('.showMoreBtn').hasAttribute('disabled'));
  });

  test('should have a disabled showMoreBtn when cannotShowMore is true', () => {
    store.outputs.get('Test').cannotShowMore = true;
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    let paragraph = document.querySelector('.showMoreBtn');
    assert(document.querySelector('.showMoreBtn').hasAttribute('disabled'));
  });

  test('should have a clearOutputBtn', () => {
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(document.querySelector('.clearOutputBtn'));
  });

  test('should have a saveOutputBtn', () => {
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
    assert(document.querySelector('.saveOutputBtn'));
  });

});

describe('Output Panel', () => {
  test('has default tab');
  test('new tab rendered');
  test('tab visible');
  test('tab not visible');
});

describe('Output Editor', () => {
  test('updates contents to reflect output');
  test('clears contents when output is cleared');
  test('cannot be updated by the user');
  test('componentDidUpdate()');
  test('outputAvailable()');
});
