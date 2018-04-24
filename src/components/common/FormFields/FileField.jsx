/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-23T13:03:39+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-23T14:13:23+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

import { Intent, Position, Tooltip, Button } from '@blueprintjs/core';

export default observer(({ field, showLabel = true, formGroup = false }) => {
  const onInputClick = () => {
    if (!field.disabled) {
      const electron = window.require('electron');
      const { remote } = electron;
      const file = remote.dialog.showOpenDialog({
        properties: ['openFile', 'showHiddenFiles']
      });

      if (file !== undefined) {
        const [filePath] = file;
        runInAction(() => {
          field.value = filePath;
        });
      }
    }
  };
  let fldClassName = formGroup ? 'pt-form-group form-group-inline' : 'pt-form-group pt-top-level';

  if (field.error) {
    fldClassName += ' pt-intent-danger';
  }
  let inputClassName = 'pt-input pt-file';
  let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
  if (formGroup) {
    if (field.options && field.options.tooltip) {
      tooltipClassName += ' table-field-90';
      inputClassName += ' table-field-100';
    } else {
      inputClassName += ' table-field-90';
    }
  }
  return (
    <div // eslint-disable-line
      className={fldClassName}
      onClick={onInputClick}
    >
      {showLabel && (
        <label className="pt-label pt-label-r-30" htmlFor={field.id}>
          {field.label}
        </label>
      )}
      <div className="pt-form-content">
        {field.options &&
          field.options.tooltip && (
            <Tooltip
              className={tooltipClassName}
              content={field.options.tooltip}
              hoverOpenDelay={1000}
              inline
              intent={Intent.PRIMARY}
              position={Position.TOP}
            >
              <input className={inputClassName} {...field.bind()} />
            </Tooltip>
          )}
        {(!field.options || !field.options.tooltip) && (
          <input className={inputClassName} {...field.bind()} />
        )}
        <Button className="pt-file-button" disabled={field.disabled} onClick={() => {}}>
          {'Browse'}
        </Button>
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
