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
 * @Date:   2017-05-09T12:16:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T15:59:44+10:00
 */

/**
  * @Author: Wahaj Shamim <wahaj>
  * @Date:   2017-04-19T15:43:32+10:00
  * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T15:59:44+10:00
  */

import React from 'react';
import { observer } from 'mobx-react';

import { Intent, Position, Tooltip, Checkbox } from '@blueprintjs/core';

export default observer(({
  field,
  formGroup = false
}) => {
  const fldClassName = formGroup
    ? 'pt-form-group form-group-inline'
    : 'pt-form-group pt-top-level';
  let inputClassName = '';
  let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';

  if (field.options && field.options.tooltip) {
    tooltipClassName += ' pt-checkbox-form';
  } else {
    inputClassName += ' pt-checkbox-form';
  }

  return (
    <div className={fldClassName}>
      <div className="pt-form-content pt-form-content-reverse">
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
            <Checkbox
              className={inputClassName}
              {...field.bind({ type: 'checkbox' })}
              checked={field.value}
              label={field.label}
            />

          </Tooltip>}
        {(!field.options || !field.options.tooltip) &&
          <Checkbox
            className={inputClassName}
            {...field.bind({ type: 'checkbox' })}
            checked={field.value}
            label={field.label}
          />}
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
