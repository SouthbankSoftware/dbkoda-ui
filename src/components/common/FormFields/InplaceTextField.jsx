/*
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

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-19T15:43:32+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-21T08:41:18+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import { Intent, Position, Tooltip } from '@blueprintjs/core';
import { EditableText } from '@blueprintjs/core';

export default observer(({ field, showLabel = true, formGroup = false }) => {
  let fldClassName = formGroup ? 'pt-form-group form-group-inline' : 'pt-form-group pt-top-level';

  if (field.error) {
    fldClassName += ' pt-intent-danger';
  }
  let inputClassName = 'pt-input';
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
    <div className={fldClassName}>
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
              <EditableText className={inputClassName} {...field.bind()} />
            </Tooltip>
          )}
        {(!field.options || !field.options.tooltip) && (
          <EditableText className={inputClassName} {...field.bind()} />
        )}
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
