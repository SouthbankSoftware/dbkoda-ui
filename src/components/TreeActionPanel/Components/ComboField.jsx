/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-11T09:42:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-12T14:37:26+10:00
 */

import React from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Autosuggest from 'react-autosuggest';
import { Intent, Position, Tooltip } from '@blueprintjs/core';

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

  onSuggestionsFetchRequested = ({ value }) => {
    console.log('------------ getSuggestions for ', value);
    runInAction('updating suggestions', () => {
      this.suggestions.clear();
      const arr = this.getSuggestions(value);
      arr.forEach((obj) => {
        console.log(obj);
        this.suggestions.push(obj);
      });
    });
  };

  onSuggestionsClearRequested = () => {
    console.log('onSuggestionsClearRequested');
    this.suggestions.clear();
  };

  getSuggestionValue = (suggestion) => {
    console.log('getSuggestionValue', suggestion);
    return suggestion;
  };

  getSuggestions = (value) => {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');

    return this.options.filter(option => regex.test(option));
  };

  setOptions = (arrOptions) => {
    if (arrOptions) {
      this.options = arrOptions;
    }
  };

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  suggestions = observable([]);
  options = [];
  inputProps;

  renderSuggestion = (suggestion) => {
    console.log('renderSuggestion:', suggestion);
    return <span>{suggestion}</span>;
  };

  render() {
    const { field, showLabel, formGroup } = this.props;

    const fldClassName = formGroup
      ? 'pt-form-group form-group-inline'
      : 'pt-form-group pt-inline';
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
    const inputProps = {
      placeholder: field.placeholder ? field.placeholder : '',
      value: field.value,
      onChange: (event, { newValue }) => {
        console.log('newValue: ', newValue);
        field.value = newValue;
        field.state.form.submit();
      }
    };

    const getSelectField = () => {
      console.log('getSelectField:', this.suggestions.peek());

      return (
        <Autosuggest
          suggestions={this.suggestions.peek()}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
          className={selectClassName}
        />
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
