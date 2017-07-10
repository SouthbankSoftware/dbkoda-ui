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
 * @Date:   2017-05-03T14:42:55+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T16:00:44+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import { Intent, Position, Tooltip } from '@blueprintjs/core';

export default observer(({
  field,
  showLabel = true,
  formGroup = false
}) => {
  const fldClassName = formGroup
    ? 'pt-form-group form-group-inline'
    : 'pt-form-group pt-top-level';
  let selectClassName = 'pt-select';
  let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
  if (formGroup) {
    if (field.options && field.options.tooltip) {
      tooltipClassName += ' table-field-90';
      selectClassName += ' table-field-100';
    } else {
      selectClassName += ' table-field-90';
    }
  }
  const getSelectField = (field) => {
    return (
      <div className={selectClassName}>
        <select
          id={field.id}
          value={field.value}
          {...field.bind()}
        >
          {field.options &&
            field.options.dropdown &&
            field.options.dropdown.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
        </select>
      </div>
    );
  };
  return (
    <div className={fldClassName}>
      {showLabel &&
        <label htmlFor={field.id} className="pt-label pt-label-r-30">
          {field.label}
        </label>}
      <div className="pt-form-content">
        {field.options &&
          field.options.tooltip &&
          <Tooltip
            className={tooltipClassName}
            content={field.options.tooltip}
            hoverOpenDelay={1000}
            inline
            intent={Intent.PRIMARY}
            position={Position.TOP}
          >
            {getSelectField(field)}
          </Tooltip>}
        {(!field.options || !field.options.tooltip) && getSelectField(field)}
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
