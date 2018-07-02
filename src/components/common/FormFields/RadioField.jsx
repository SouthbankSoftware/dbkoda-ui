/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-06-27T10:58:54+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-06-27T11:44:17+10:00
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
import { inject, observer } from 'mobx-react';
import { Intent, Position, Tooltip, RadioGroup, Radio, Label } from '@blueprintjs/core';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class RadioField extends React.Component {
  static get defaultProps() {
    return {
      formGroup: false
    };
  }

  render() {
    const { field, formGroup } = this.props;
    const fldClassName = formGroup
      ? 'pt-form-group form-group-inline'
      : 'pt-form-group pt-top-level';
    let radioClassName = 'pt-radio-group';
    let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
    if (formGroup) {
      if (field.options && field.options.tooltip) {
        tooltipClassName += ' table-field-90';
        radioClassName += ' table-field-100';
      } else {
        radioClassName += ' table-field-90';
      }
    }
    const onChange = event => {
      field.value = event.currentTarget.value;
      field.state.form.submit();
    };

    const getRadioField = () => {
      if (field.value == '' && field.options.defaultValue) {
        field.value = field.options.defaultValue;
      }
      return (
        <div className={radioClassName}>
          <RadioGroup
            id={field.id}
            label={field.label}
            selectedValue={field.value}
            onChange={onChange}
          >
            {field.options &&
              field.options.radios &&
              field.options.radios.map(radio => {
                if (radio.tooltip) {
                  const radioItemClassName = 'radio-' + radio.value;
                  const tooltipLabel = (
                    <Tooltip
                      className={tooltipClassName}
                      content={radio.tooltip}
                      hoverOpenDelay={1000}
                      inline
                      intent={Intent.PRIMARY}
                      position={Position.TOP}
                    >
                      <Label
                        text={radio.label}
                        onClick={() => {
                          document.getElementsByClassName(radioItemClassName)[0].click();
                        }}
                      />
                    </Tooltip>
                  );
                  return (
                    <Radio
                      key={radio.value}
                      value={radio.value}
                      labelElement={tooltipLabel}
                      className={radioItemClassName}
                    />
                  );
                }
                return <Radio key={radio.value} label={radio.label} value={radio.value} />;
              })}
          </RadioGroup>
        </div>
      );
    };
    return (
      <div className={fldClassName}>
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
                {getRadioField(field)}
              </Tooltip>
            )}
          {(!field.options || !field.options.tooltip) && getRadioField(field)}
          <p className="pt-form-helper-text">{field.error}</p>
        </div>
      </div>
    );
  }
}
