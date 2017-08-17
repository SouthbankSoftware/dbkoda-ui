/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-17T17:35:04+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-17T20:05:17+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
// import { Radio } from '@blueprintjs/core';
import './style.scss';

@observer
export default class FileInput extends React.Component {
  onChange = (value) => {
    console.log('onChange:', value);
  };
  onInputClick = () => {
    this.props.divOnClick();
    const electron = window.require('electron');
    const remote = electron.remote;
    const file = remote.dialog.showOpenDialog({
      properties: [
        'openFile',
        'showHiddenFiles',
        // ,'openDirectory', 'multiSelections'
      ],
    });

    if (file !== undefined) {
      console.log(file[0]);
      this.props.field.value = file[0];
    }
  };
  render() {
    const { field } = this.props;
    return (
      <div // eslint-disable-line
        className={field.name + '-input-content'}
        onClick={this.onInputClick}
        onFocus={this.props.divOnFocus}
      >
        <div className="pt-form-content">
          <label className="pt-file-upload" htmlFor={field.name}>
            <input
              type="file"
              onChange={this.onChange}
              onClick={this.onInputClick}
            />
            <span className="pt-file-upload-input">
              {field.value != '' ? field.value : 'Private Key...'}
            </span>
          </label>
        </div>
      </div>
    );
  }
}
