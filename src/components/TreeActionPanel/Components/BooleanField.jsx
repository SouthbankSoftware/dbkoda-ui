/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-09T12:16:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T15:02:13+10:00
 */

/**
  * @Author: Wahaj Shamim <wahaj>
  * @Date:   2017-04-19T15:43:32+10:00
  * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T15:02:13+10:00
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
    : 'pt-form-group pt-inline';
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
