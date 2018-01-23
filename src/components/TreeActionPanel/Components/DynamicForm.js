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
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-23T09:51:53+10:00
 */

import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';

export class DynamicForm extends MobxReactForm {
  sendFormValues;
  validateFormValues;
  constructor(setup, options) {
    super(setup, options);
    this.sendFormValues = options.updates;
    this.validateFormValues = options.validate;
  }
  hooks() {
    return {
      onSuccess(form) {
        // get field values
        const formValues = form.values();
        if (this.validateFormValues) {
          try {
            const valid = this.validateFormValues(formValues);
            if (valid && this.sendFormValues) {
              this.sendFormValues(formValues);
            }
          } catch (e) {
            form.invalidate(e.message);
          }
        }
      },
      onError(form) {
        // get all form errors
        console.error('All form errors', form.errors());
        // invalidate the form with a custom error message
        form.invalidate(globalString('tree/genericValidateError'));
      }
    };
  }
  onValueChange(form) {
    if (form.isValid) {
      form.submit();
    }
  }
  onFieldChange = field => e => {
    e.preventDefault();
    field.onChange(e);
    field.state.form.submit();
  };
  onFieldClick = field => () => {
    field.state.form.submit();
  };
  onFieldValueChange = (value, field) => {
    field.value = value;
    field.state.form.submit();
  };
  onNumericValueChange = field => value => {
    field.value = value;
    field.state.form.submit();
  };
  onComboValueChange = field => (event, { newValue }) => {
    field.value = newValue;
    field.state.form.submit();
  };
  bindings() {
    return {
      TextField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      CodeMirrorField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      BooleanField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, field.onChange),
        onClick: $try(props.onClick, this.onFieldClick(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      SelectField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      ComboField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onComboValueChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      NumericField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus),
        onValueChange: $try(
          props.onValueChange,
          this.onNumericValueChange(field)
        )
      })
    };
  }
  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: $validator => {
          const messages = $validator.getMessages('en');
          messages.required = globalString('tree/fieldRequired');
          $validator.setMessages('en', messages);
        }
      }
    };
  }
}
