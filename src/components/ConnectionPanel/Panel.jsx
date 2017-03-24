/**
 * connection profile panel class
 */
import React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from 'mobx';
import autobind from 'autobind-decorator';
import {AnchorButton} from '@blueprintjs/core';
import Radio from './Radio';
import Input from './Input';
import Checkbox from './Checkbox';
import './style.scss';
import {featherClient} from '~/helpers/feathers';
import Label from './Label';

@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {connecting: false, testing: false};
  }

  @autobind _hostRadioOnChange() {
    this.props.form.$('hostRadio').set('value', !this.props.form.$('hostRadio').get('value'));
    this.props.form.$('urlRadio').set('value', !this.props.form.$('hostRadio').get('value'));
  }

  @autobind _connect(data) {
    this.setState({connecting: true});
    this.props.connect(data).then(() => this.setState({connecting: false})).catch(()=>this.setState({connecting: false}));
  }

  @autobind _test(data) {
    this.setState({testing: true});
    this.props.connect(data).then(() => this.setState({testing: false})).catch(()=>this.setState({testing: false}));
  }


  render() {
    const {form, title} = this.props;
    form.connect = this._connect;
    form.test = this._test;
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">{title}</h3>
        <form className="profile-form" onSubmit={form.onSubmit}>
          <div>
            <ul>
              <li>
                <Label text="Alias"/>
              </li>
              <li>
                <Radio field={form.$('hostRadio')} onChange={this._hostRadioOnChange}/>
              </li>
              <li>
                <Radio field={form.$('urlRadio')} onChange={this._hostRadioOnChange}/>
              </li>
              <li><Label text="Database"/></li>
            </ul>
            <ul>
              <li>
                <Input field={form.$('alias')}/>
              </li>
              <li>
                <div className="host-input-container">
                  <Input
                    field={form.$('host')}
                    showLabel={false}
                    disable={!form.$('hostRadio').get('value')}
                  />
                  <Label text="Port"/>
                  <Input
                    field={form.$('port')}
                    showLabel={false}
                    disable={!form.$('hostRadio').get('value')}
                  />
                </div>
              </li>
              <li>
                <Input
                  field={form.$('url')}
                  showLabel={false}
                  disable={!form.$('urlRadio').get('value')}
                />
              </li>
              <li>
                <div className="host-input-container">
                  <Input field={form.$('database')}/>
                  <Checkbox field={form.$('ssl')}/>
                </div>
              </li>
            </ul>
          </div>
          <div className="profile-separator"/>
          <Label className="profile-align-left" text="Authentication"/>
          <Checkbox field={form.$('sha')}/>
          <div>
            <ul>
              <li><Label text="User Name"/></li>
              <li><Label text="Password"/></li>
            </ul>
            <ul>
              <li><Input field={form.$('username')} disable={!form.$('sha').get('value')}/></li>
              <li><Input field={form.$('password')} disable={!form.$('sha').get('value')}/></li>
            </ul>
          </div>
          <div className="profile-button-panel">
            <AnchorButton
              className="pt-button pt-intent-success"
              onClick={form.onSubmit}
              text="Connect"
              loading={this.state.connecting}
            />
            <AnchorButton
              className="pt-button pt-intent-primary"
              onClick={form.onReset}
              text="Reset"
            />
            <AnchorButton
              className="pt-button pt-intent-primary"
              onClick={form.onTest.bind(form)}
              text="Test"
              loading={this.state.testing}
            />
            <AnchorButton
              className="pt-button pt-intent-primary"
              text='Close'
              onClick={this.props.close}
            />
          </div>
        </form>
      </div>
    );
  }
}
