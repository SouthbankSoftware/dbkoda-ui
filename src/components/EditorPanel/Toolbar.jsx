/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T16:36:44+11:00
 */

import React from 'react';
import {featherClient} from '~/helpers/feathers';
import {observer, observable} from 'mobx-react';
import {Button, Intent} from '@blueprintjs/core';
import {NewToaster} from '~/common/Toaster.jsx';

/* eslint-disable react/sort-comp */

@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newConnectionLoading: false,
      id: 0,
      shellId: 0
    };

    this.addEditor = this
      .addEditor
      .bind(this);
    this.removeEditor = this
      .removeEditor
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
  }

  // -------------------// . TOOLBAR ACTIONS // ----------------- // Placeholder -
  // Linting disabled for this line.
  addEditor() { // eslint-disable-line class-methods-use-this
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
          this.state.id = res.id;
          this.state.shellId = res.shellId;
          console.log(this.state.id, ' + ', this.state.shellId);
          NewToaster.show({message: 'Connection Success!', intent: Intent.SUCCESS, iconName: 'pt-icon-thumbs-up'});
          this.setState({newConnectionLoading: false});
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
  removeEditor() { // eslint-disable-line class-methods-use-this
    NewToaster.show({message: 'Sorry, not yet implemented!', intent: Intent.DANGER, iconName: 'pt-icon-thumbs-down'});
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

  render() {
    return (
      <nav className="pt-navbar pt-dark editorToolBar">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-button-group">
            <Button
              className="pt-button pt-icon-add pt-intent-primary"
              loading={this.state.newConnectionLoading}
              onClick={this.addEditor} />
            <Button
              className="pt-button pt-icon-delete pt-intent-primary"
              onClick={this.removeEditor} />
          </div>
          <span className="pt-navbar-divider" />
          <Button
            className="pt-button pt-icon-document-open pt-intent-primary"
            onClick={this.openFile} />
          <Button
            className="pt-button pt-icon-floppy-disk pt-intent-primary"
            onClick={this.saveFile} />
          <span className="pt-navbar-divider" />
          <div className="pt-button-group">
            <Button
              className="pt-button pt-icon-chevron-right pt-intent-primary"
              onClick={this.executeLine} />
            <Button
              className="pt-button pt-icon-double-chevron-right pt-intent-primary"
              onClick={this.executeAll} />
            <Button
              className="pt-button pt-icon-help pt-intent-primary"
              onClick={this.explainPlan} />
            <Button
              className="pt-button pt-icon-stop pt-intent-warning"
              onClick={this.stopExecution} />
          </div>
          <span className="pt-navbar-divider" />
          <input className="pt-input" placeholder="Search Tabs..." type="text" />
        </div>
      </nav>
    );
  }
}
