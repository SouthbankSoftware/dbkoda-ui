/**
* @Author: chris
* @Date:   2017-03-10T10:55:54+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-19T11:32:30+10:00
*/
import ReactDOM from 'react-dom';
import { assert } from 'chai';
import { Provider } from 'mobx-react';
import Store from '~/stores/global';
import globalizeInit from '#/tests/helpers/globalize.js';
import { OutputToolbar } from '../index.js';

const jsdom = require('jsdom').jsdom;
const React = require('react');

describe('Output Toolbar', () => {
  let document;
  let window; // eslint-disable-line
  let store;
  const OutputToolbarWrapper = function OutputToolbarWrapper(props) {
    return (<Provider store={props.store}><OutputToolbar title="Test" /></Provider>);
  };

  beforeAll(() => {
    globalizeInit();
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
    assert(!document.querySelector('.showMoreBtn').hasAttribute('disabled'));
  });

  test('should have a disabled showMoreBtn when cannotShowMore is true', () => {
    store.outputs.get('Test').cannotShowMore = true;
    ReactDOM.render(<OutputToolbarWrapper store={store} />, document.getElementById('container'));
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
