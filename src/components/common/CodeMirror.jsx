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

import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';
import { debounce, isEqual } from 'lodash';
import createReactClass from 'create-react-class';

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

const CodeMirror = createReactClass({
  propTypes: {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    codeMirrorInstance: PropTypes.func,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onCursorActivity: PropTypes.func,
    onFocusChange: PropTypes.func,
    onScroll: PropTypes.func,
    options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    path: PropTypes.string,
    value: PropTypes.string,
    preserveScrollPosition: PropTypes.bool,
  },
  getDefaultProps() {
    return {
      preserveScrollPosition: false,
    };
  },
  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require('codemirror');
  },
  getInitialState() {
    return {
      isFocused: false,
    };
  },
  componentWillMount() {
    this.componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0,
    );
    if (this.props.path) {
      console.error(
        'Warning: react-codemirror: the `path` prop has been changed to `name`',
      );
    }
  },
  componentDidMount() {
    const CodeMirror = this.getCodeMirrorInstance();
    this.codeMirror = new CodeMirror(this.editorElement, this.props.options);
    this.codeMirror.setOption('mode', this.props.options.mode); // for some unknown reason, the constructor on the above line is not setting the mode correctly
    this.codeMirror.on('change', this.codemirrorValueChanged);
    this.codeMirror.on('cursorActivity', this.cursorActivity);
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
    this.codeMirror.on('scroll', this.scrollChanged);
  },
  componentWillUnmount() {
    this.codeMirror.doc.cm = null;
  },
  componentWillReceiveProps(nextProps) {
    if (
      this.codeMirror &&
      nextProps.value !== undefined &&
      nextProps.value !== this.props.value &&
      normalizeLineEndings(this.codeMirror.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(
          prevScrollPosition.left,
          prevScrollPosition.top,
        );
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === 'object') {
      for (const optionName in nextProps.options) {
        if (
          Object.prototype.hasOwnProperty.call(nextProps.options, optionName)
        ) {
          this.setOptionIfChanged(optionName, nextProps.options[optionName]);
        }
      }
    }
  },
  setOptionIfChanged(optionName, newValue) {
    const oldValue = this.codeMirror.getOption(optionName);
    if (!isEqual(oldValue, newValue)) {
      this.codeMirror.setOption(optionName, newValue);
    }
  },
  getCodeMirror() {
    return this.codeMirror;
  },
  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },
  focusChanged(focused) {
    this.setState({
      isFocused: focused,
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  },
  cursorActivity(cm) {
    this.props.onCursorActivity && this.props.onCursorActivity(cm);
  },
  scrollChanged(cm) {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
  },
  codemirrorValueChanged(doc, change) {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change);
    }
  },
  render() {
    const editorClassName = className(
      'ReactCodeMirror',
      this.state.isFocused ? 'ReactCodeMirror--focused' : null,
      this.props.className,
    );
    return (
      <div
        className={editorClassName}
        ref={ref => (this.editorElement = ref)}
      />
    );
  },
});

export default CodeMirror;
