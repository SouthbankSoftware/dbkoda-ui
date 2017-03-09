/* eslint-disable-line react/prop-types */
/* eslint-disable react/sort-comp */

import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, inject} from 'mobx-react';
import {Button, Intent} from '@blueprintjs/core';
import {NewToaster} from '#/common/Toaster';

@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeProfileList: ['No Active Profile'],
      newConnectionLoading: false,
      currentProfile: 0,
      noActiveProfile: true,
      noExecutionRunning: true,
      id: 0,
      shellId: 0
    };

    this.addEditor = this
      .addEditor
      .bind(this);
    this.executeLine = this
      .executeLine
      .bind(this);
    this.executeAll = this
      .executeAll
      .bind(this);
    this.explainPlan = this
      .explainPlan
      .bind(this);
    this.onDropdownChanged = this
      .onDropdownChanged
      .bind(this);
  }

  // -------------------// . TOOLBAR ACTIONS // ----------------- //
  addEditor() {
    try {
      this.setState({newConnectionLoading: true});
      featherClient()
        .service('/mongo-connection')
        .create({}, {
          query: {
            url: 'mongodb://ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com'
          }
        })
        .then((res) => {
          console.log('get response', res);
          this
            .props
            .store // eslint-disable-line react/prop-types
            .editors // eslint-disable-line react/prop-types
            .set(res.id, res.shellId);  // eslint-disable-line react/prop-types
          // Set States
          this.setState({id: res.id});
          this.setState({shellId: res.shellId});
          this.setState({newConnectionLoading: false});
          const tempProfileList = this.state.activeProfileList;
          tempProfileList.push(res.id);
          this.setState({activeProfileList: tempProfileList});

          // Send message to Panel to crate new editor.
          this
            .props
            .newEditor(res.id); // eslint-disable-line react/prop-types
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
        })
        .catch((err) => {
          console.log('connection failed ', err.message);
          NewToaster.show({message: err.message, intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
          this.setState({newConnectionLoading: false});
        });
    } catch (err) {
      NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    }
  }
  // Placeholder - Linting disabled for this line.
  openFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  saveFile() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  executeLine() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  executeAll() {
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
    this
      .props
      .executeAll(); // eslint-disable-line react/prop-types
  }
  // Placeholder - Linting disabled for this line.
  explainPlan() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }
  // Placeholder - Linting disabled for this line.
  stopExecution() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
  }

  onDropdownChanged() {
    this.setState({currentProfile: event.target.value});
    if (event.target.value == 0) {
      this.setState({noActiveProfile: true});
    } else {
      this.setState({noActiveProfile: false});
    }
  }

  render() {
    return (
      <nav className="pt-navbar editorToolBar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <Button
              className="pt-button pt-icon-add pt-intent-primary"
              loading={this.state.newConnectionLoading}
              onClick={this.addEditor} />
            <Button
              className="pt-button pt-icon-document-open pt-intent-primary"
              onClick={this.openFile} />
            <Button
              className="pt-button pt-icon-floppy-disk pt-intent-primary"
              onClick={this.saveFile} />
          </div>
          <span className="pt-navbar-divider" />
          <div className="pt-button-group pt-intent-primary">
            <div className="pt-select pt-intent-primary">
              <select
                onChange={this.onDropdownChanged}
                defaultValue="1"
                className="pt-intent-primary">
                {this
                  .state
                  .activeProfileList
                  .map((name, index) => {
                    return <option value={index}>{name}</option>;
                  })}
              </select>
            </div>
            <Button
              className="pt-button pt-icon-chevron-right pt-intent-primary"
              onClick={this.executeLine}
              disabled={this.state.noActiveProfile} />
            <Button
              className="pt-button pt-icon-double-chevron-right pt-intent-primary"
              onClick={this.executeAll}
              disabled={this.state.noActiveProfile} />
            <Button
              className="pt-button pt-icon-help pt-intent-primary"
              onClick={this.explainPlan}
              disabled={this.state.noActiveProfile} />
            <Button
              className="pt-button pt-icon-stop pt-intent-danger"
              onClick={this.stopExecution}
              disabled={this.state.noExecutionRunning} />
          </div>
          <span className="pt-navbar-divider" />
          <input className="pt-input" placeholder="Search Tabs..." type="text" />
        </div>
      </nav>
    );
  }
}
