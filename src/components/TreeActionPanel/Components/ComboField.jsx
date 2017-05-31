/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-11T09:42:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T15:59:54+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import Select from 'react-select';
import { Intent, Position, Tooltip } from '@blueprintjs/core';

import 'react-select/dist/react-select.css';

@observer
export default class ComboField extends React.Component {
  static get defaultProps() {
    return {
      showLabel: true,
      formGroup: false
    };
  }

  constructor(props) {
    super(props);
    const { field } = this.props;

    this.setOptions(field.options.dropdown);
  }

  setOptions = (arrOptions) => {
    if (arrOptions) {
      this.options = [];
      arrOptions.forEach((opt) => {
        this.options.push({ value: opt, label: opt });
      });
      // this.options = arrOptions;
    }
  };

  options = [];

  render() {
    const { field, showLabel, formGroup } = this.props;

    const fldClassName = formGroup
      ? 'pt-form-group form-group-inline'
      : 'pt-form-group pt-top-level';
    let selectClassName = '';
    let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
    if (formGroup) {
      if (field.options && field.options.tooltip) {
        tooltipClassName += ' table-field-90';
        selectClassName += ' table-field-100';
      } else {
        selectClassName += ' table-field-90';
      }
    }

    const onChange = (newValue) => {
      console.log('newValue: ', newValue);
      field.value = (newValue && newValue.value) ? newValue.value : '';
      field.state.form.submit();
    };

    const getSelectField = () => {
      return (
        <Select.Creatable className={selectClassName}
          multi={false} options={this.options} onChange={onChange} value={field.value} />
      );
    };
    return (
      <div className={fldClassName}>
        {showLabel &&
          <label htmlFor={field.id} className="pt-label pt-label-r-30">
            {field.label}
          </label>}
        <div className="pt-form-content" label={field.label ? field.label : field.name}>
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
              {getSelectField()}
            </Tooltip>}
          {(!field.options || !field.options.tooltip) && getSelectField()}
          <p className="pt-form-helper-text">{field.error}</p>
        </div>
      </div>
    );
  }
}
