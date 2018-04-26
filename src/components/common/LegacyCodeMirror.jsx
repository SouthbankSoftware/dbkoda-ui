/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2016-11-22T14:04:59+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-21T13:16:17+11:00
 */

const React = require('react');
const PropTypes = require('prop-types');
const ReactDOM = require('react-dom');

const { findDOMNode } = ReactDOM;
const className = require('classnames');
const { debounce } = require('lodash');

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

class CodeMirror extends React.Component {
  static propTypes = {
    className: PropTypes.any,
    codeMirrorInstance: PropTypes.func,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    onFocusChange: PropTypes.func,
    onScroll: PropTypes.func,
    options: PropTypes.object,
    path: PropTypes.string,
    value: PropTypes.string,
    preserveScrollPosition: PropTypes.bool,
    alwaysScrollToBottom: PropTypes.bool
  };

  static defaultProps = {
    preserveScrollPosition: false,
    alwaysScrollToBottom: false
  };

  state = {
    isFocused: false,
    isPropsInitialized: false
  };

  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require('codemirror');
  }

  componentWillMount() {
    this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0);
  }

  componentDidMount() {
    const textareaNode = findDOMNode(this.refs.textarea); // eslint-disable-line react/no-find-dom-node, react/no-string-refs
    const codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options);
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this));
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
    this.codeMirror.on('scroll', this.scrollChanged.bind(this));
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');
  }

  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.codeMirror &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else if (this.props.alwaysScrollToBottom) {
        this.codeMirror.setValue(nextProps.value);
        const nextScrollPosition = this.codeMirror.getScrollInfo();
        const scrollTop = nextScrollPosition.height - nextScrollPosition.clientHeight;
        this.codeMirror.scrollTo(nextScrollPosition.left, scrollTop);
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === 'object') {
      for (const optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  focusChanged(focused) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  scrollChanged(cm) {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo());
  }

  codemirrorValueChanged(doc, change) {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change);
    }
    if (!this.state.isPropsInitialized && this.props.alwaysScrollToBottom) {
      this.setState({
        isPropsInitialized: true
      });
      const nextScrollPosition = this.codeMirror.getScrollInfo();
      const scrollTop = nextScrollPosition.height - nextScrollPosition.clientHeight;
      this.codeMirror.scrollTo(nextScrollPosition.left, scrollTop);
    }
  }

  render() {
    const editorClassName = className(
      'ReactCodeMirror',
      this.state.isFocused ? 'ReactCodeMirror--focused' : null,
      this.props.className
    );
    /* eslint-disable react/no-string-refs */
    return (
      <div className={editorClassName}>
        <textarea
          ref="textarea"
          name={this.props.path}
          defaultValue={this.props.value}
          autoComplete="off"
        />
      </div>
    );
    /* eslint-enable react/no-string-refs */
  }
}

module.exports = CodeMirror;
