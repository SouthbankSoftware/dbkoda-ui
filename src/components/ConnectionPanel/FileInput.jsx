/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-17T17:35:04+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-22T12:09:48+10:00
 */
/* eslint no-unused-vars:warn */

import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@blueprintjs/core';
import './style.scss';

@observer
export default class FileInput extends React.Component {
  onChange = (value) => {
    // @TODO -> Is this needed, only had a comment in it?
  };
  onInputClick = () => {
    this.props.divOnClick();
    const electron = window.require('electron');
    const remote = electron.remote;
    const file = remote.dialog.showOpenDialog({
      properties: ['openFile', 'showHiddenFiles'],
    });

    if (file !== undefined) {
      this.props.field.value = file[0];
    }
  };
  render() {
    const { field } = this.props;
    return (
      <div // eslint-disable-line
        className={field.name + '-input-content pt-form-group pt-inline'}
        onClick={this.onInputClick}
        onFocus={this.props.divOnFocus}
      >
        <div className="pt-form-content field-inline">
          <input
            className={field.name + '-input pt-input'}
            type="text"
            {...field.bind()} // eslint-disable-line
            style={{ cursor: 'pointer' }}
          />
          <p className="pt-form-helper-text">{field.error}</p>
        </div>
        <div className="field-inline">
          <Button className="browse-directory" onClick={() => {}}>
            {'Browse'}
          </Button>
        </div>
      </div>
    );
  }
}
