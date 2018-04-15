/*
@flow
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

/* eslint-disable react/no-string-refs */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnchorButton } from '@blueprintjs/core';
import GeneralFeatures from './FeatureGuides/GeneralFeatures.jsx';
import ConnectionFeatures from './FeatureGuides/ConnectionFeatures.jsx';
import OutputFeatures from './FeatureGuides/OutputFeatures.jsx';
import PerformanceFeatures from './FeatureGuides/PerformanceFeatures.jsx';
import QueriesFeatures from './FeatureGuides/QueriesFeatures.jsx';

type Props = {};
type State = {
  currentGroup: *
};

const categories: * = {
  GENERAL: 'general',
  CONNECTION: 'connection',
  QUERIES: 'queries',
  OUTPUT: 'output',
  PERFORMANCE: 'performance'
};

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Features extends React.Component<Props, State> {
  static propTypes = {};
  constructor(props: Props) {
    super(props);
    this.state = {
      currentGroup: 'general'
    };
  }

  renderHotkeys() {
    switch (this.state.currentGroup) {
      case categories.GENERAL:
        return (
          <div className="generalFeatures">
            <GeneralFeatures />
          </div>
        );
      default:
      case categories.CONNECTION:
        return (
          <div className="connectionFeatures">
            <ConnectionFeatures />
          </div>
        );
      case categories.QUERIES:
        return (
          <div className="queriesFeatures">
            <QueriesFeatures />
          </div>
        );
      case categories.OUTPUT:
        return (
          <div className="outputFeatures">
            <OutputFeatures />
          </div>
        );
      case categories.PERFORMANCE:
        return (
          <div className="performanceFeatures">
            <PerformanceFeatures />
          </div>
        );
    }
  }

  render() {
    // const codeMirrorHotkeys = Object.values(CodeMirrorHotkeys);
    const general = false || this.state.currentGroup === 'general';
    const connection = false || this.state.currentGroup === 'connection';
    const queries = false || this.state.currentGroup === 'queries';
    const output = false || this.state.currentGroup === 'output';
    const performance = false || this.state.currentGroup === 'performance';
    return (
      <div className="learnShortcutsWrapper">
        <div className="groupsList">
          <div
            className={'welcomeButtonWrapper selected_' + general.toString()}
          >
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={() => {
                this.setState({ currentGroup: categories.GENERAL });
              }}
            >
              General
            </AnchorButton>
          </div>
          <div
            className={'welcomeButtonWrapper selected_' + connection.toString()}
          >
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={() => {
                this.setState({ currentGroup: categories.CONNECTION });
              }}
            >
              Connection
            </AnchorButton>
          </div>
          <div
            className={'welcomeButtonWrapper selected_' + queries.toString()}
          >
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={() => {
                this.setState({ currentGroup: categories.QUERIES });
              }}
            >
              Queries
            </AnchorButton>
          </div>
          <div className={'welcomeButtonWrapper selected_' + output.toString()}>
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={() => {
                this.setState({ currentGroup: categories.OUTPUT });
              }}
            >
              Output
            </AnchorButton>
          </div>
          <div
            className={
              'welcomeButtonWrapper selected_' + performance.toString()
            }
          >
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={() => {
                this.setState({ currentGroup: categories.PERFORMANCE });
              }}
            >
              Performance
            </AnchorButton>
          </div>
        </div>
        <div className="hotkeysList">{this.renderHotkeys()}</div>
      </div>
    );
  }
}
