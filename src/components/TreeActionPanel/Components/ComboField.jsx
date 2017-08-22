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
 * @Date:   2017-05-11T09:42:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T15:59:54+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import Select from 'react-select';
import { Intent, Position, Tooltip } from '@blueprintjs/core';

import 'react-select/dist/react-select.css';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class ComboField extends React.Component {
  static get defaultProps() {
    return {
      showLabel: true,
      formGroup: false,
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
      const editor = this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId,
      );
      if (this.options[0].value !== '') {
        // A new option has been added.
        if (editor.type === 'aggregate') {
          const block = editor.blockList[editor.selectedBlock];
          // Do custom fields exist
          if (block.customFields) {
            if (block.customFields[field.path.replace(/.[0-9]./g, '[].')]) {
              block.customFields[field.path.replace(/.[0-9]./g, '[].')].push(
                newValue.value,
              );
            } else {
              block.customFields[field.path.replace(/.[0-9]./g, '[].')] = [];
              block.customFields[field.path.replace(/.[0-9]./g, '[].')].push(
                newValue.value,
              );
            }
          } else {
            block.customFields = {};
            block.customFields[field.path.replace(/.[0-9]./g, '[].')] = [];
            block.customFields[field.path.replace(/.[0-9]./g, '[].')].push(
              newValue.value,
            );
          }
        }
      }

      field.value = newValue && newValue.value ? newValue.value : '';
      field.state.form.submit();
    };

    const getSelectField = () => {
      return (
        <Select.Creatable
          className={selectClassName}
          multi={false}
          options={this.options}
          onChange={onChange}
          value={field.value}
        />
      );
    };
    return (
      <div className={fldClassName}>
        {showLabel &&
          <label htmlFor={field.id} className="pt-label pt-label-r-30">
            {field.label}
          </label>}
        <div
          className="pt-form-content"
          label={field.label ? field.label : field.name}
        >
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
          <p className="pt-form-helper-text">
            {field.error}
          </p>
        </div>
      </div>
    );
  }
}
