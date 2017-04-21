/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import './style.scss';

export default observer(({text, className}) => (
  <div className={'cell-column-container ' + className}>
    <label className="field-label pt-label" htmlFor={text}>{text}</label>
  </div>
));
