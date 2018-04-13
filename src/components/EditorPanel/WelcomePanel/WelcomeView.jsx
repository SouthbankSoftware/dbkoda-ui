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
 * @Author: Michael Harrison <mike>
 * @Date:   2017-04-10 14:32:37
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-04-10 14:32:40
 */

/* eslint-disable react/no-string-refs */
import React from 'react';
import { inject, observer } from 'mobx-react';
import DBKodaIcon from '../../../styles/icons/dbkoda-logo.svg';
import WelcomeMenu from './WelcomeMenu.jsx';
import WelcomeContent from './WelcomeContent.jsx';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class WelcomeView extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderWelcomePage() {
    switch (this.props.store.welcomePage.currentContent) {
      case 'Welcome':
        return <WelcomeContent />;
      default:
        return <div>ERROR</div>;
    }
  }

  render() {
    return (
      <div className="welcomePanelTabWrapper">
        <div className="welcomePanelWrapper">
          <div className="welcomeTitleWrapper">
            <DBKodaIcon className="dbKodaLogo" width={20} height={20} />
            <h1>Welcome To DBKoda</h1>
          </div>
          <div className="welcomeMiddleSection">
            <div className="welcomeMenuWrapper">
              <WelcomeMenu />
            </div>
            <div className="welcomeContentWrapper">
              {this.renderWelcomePage()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
