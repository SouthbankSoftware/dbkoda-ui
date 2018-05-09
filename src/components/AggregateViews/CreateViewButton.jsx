/**
 * @Author: christrott
 * @Date:   2018-03-27T11:23:12+10:00
 * @Last modified by:   christrott
 * @Last modified time: 2018-03-27T12:16:51+10:00
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
import { action, runInAction } from 'mobx';
import { AnchorButton, Dialog, Intent, Tooltip, Position } from '@blueprintjs/core';
import './CreateViewButton.scss';
import DocumentsIcon from '../../styles/icons/documents-icon.svg';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class CreateViewButton extends React.Component {
  constructor(props) {
    super(props);
    runInAction('Construct new CreateView button', () => {
      this.props.store.aggregateBuilder.includeCreateView = false;
    });
  }

  @action.bound
  openViewNameDialog() {
    this.props.store.aggregateBuilder.showViewNameDialog = true;
    // Wait until dialog is rendered before focus
    setTimeout(() => {
      this.viewNameInput.focus();
    }, 0);
  }

  @action.bound
  closeViewNameDialog() {
    this.props.store.aggregateBuilder.showViewNameDialog = false;
  }

  @action.bound
  cancelViewNameDialog() {
    this.props.store.aggregateBuilder.viewName = '';
    this.props.store.aggregateBuilder.includeCreateView = false;
    this.props.store.editorPanel.updateAggregateDetails = true;
    this.closeViewNameDialog();
  }

  @action.bound
  submitViewNameDialog() {
    this.props.store.aggregateBuilder.viewName = this.viewNameInput.value;
    this.props.store.editorPanel.updateAggregateDetails = true;
    this.closeViewNameDialog();
  }

  render() {
    const buttonClasses = this.props.store.aggregateBuilder.includeCreateView
      ? 'createViewButton circleButton selected'
      : 'createViewButton circleButton';
    return (
      <span>
        <Tooltip
          intent={Intent.PRIMARY}
          hoverOpenDelay={1000}
          inline
          content={globalString('aggregate_builder/create_view_button')}
          tooltipClassName="pt-dark"
          position={Position.BOTTOM}
        >
          <AnchorButton
            className={buttonClasses}
            intent={Intent.SUCCESS}
            onClick={() => {
              runInAction(() => {
                const { includeCreateView } = this.props.store.aggregateBuilder;
                this.props.store.aggregateBuilder.includeCreateView = !includeCreateView;
                if (includeCreateView) {
                  this.cancelViewNameDialog();
                } else {
                  this.openViewNameDialog();
                }
                this.props.store.editorPanel.updateAggregateDetails = true;
              });
            }}
          >
            <DocumentsIcon className="dbKodaSVG" width={20} height={20} />
          </AnchorButton>
        </Tooltip>
        <Dialog
          className="createViewDialog"
          isOpen={this.props.store.aggregateBuilder.showViewNameDialog}
          onClose={this.cancelViewNameDialog}
        >
          <p>{globalString('aggregate_builder/alerts/create_view_message')}</p>
          <input
            type="text"
            ref={input => {
              this.viewNameInput = input;
            }}
            className="pt-input"
            placeholder="View Name"
          />
          <div className="dialogButtons">
            <AnchorButton
              className="openButton"
              type="submit"
              intent={Intent.SUCCESS}
              onClick={this.submitViewNameDialog}
            >
              {globalString('aggregate_builder/alerts/okay')}
            </AnchorButton>
            <AnchorButton
              className="cancelButton"
              intent={Intent.DANGER}
              onClick={this.cancelViewNameDialog}
            >
              {globalString('aggregate_builder/alerts/cancel')}
            </AnchorButton>
          </div>
        </Dialog>
      </span>
    );
  }
}
