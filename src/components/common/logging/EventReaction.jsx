
/* eslint-disable react/no-string-refs */
/* eslint-disable no-unused-vars */

import {observer, inject} from 'mobx-react';
import {observe, action, reaction} from 'mobx';

const React = require('react');
const _ = require('lodash');
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 */
@inject('store')
@observer
export default class EventReaction extends React.Component {
  constructor(props) {
    super(props);
    const store = this.props.store;
    const createProfileObserver = observe(store.editors, change => this.observeCreateProfile(change));
    console.log('Logging framework started...');
  }

  observeCreateProfile(change) {
    switch (change.type) {
      case 'add':
        console.log('[Event] - Adding Editor Panel Event.');
        break;
      case 'remove':
        console.log('[Event] - Removing Editor Panel Event.');
      break;
      default:
        console.log('[Event] - Unknown Event.');
      break;
    }
    console.log(change);
  }

  render() {
    return <div />;
  }
}
