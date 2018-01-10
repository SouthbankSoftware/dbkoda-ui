/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:32:20+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-10T10:54:29+11:00
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

import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import RGL, { WidthProvider } from 'react-grid-layout';
import { ConnectionForm, Subforms } from './ConnectionForm';
import './Panel.scss';

const ReactGridLayout = WidthProvider(RGL);

type Props = {
  store: any,
  api: *
};

type State = {
  selectedSubform: string
};
@inject(({ store, api }) => {
  return {
    store,
    api
  };
})
@observer
export default class ProfileManager extends React.Component<Props, State> {
  profileForm: null;
  subForms: null;

  static defaultProps = {
    store: null,
    api: null
  };

  state = {
    selectedSubform: 'Basic'
  };

  constructor(props: Props) {
    super(props);

    const { store } = this.props;
    const pf = new ConnectionForm();
    if (store && store.profileList.selectedProfile) {
      this.profileForm = pf.getInstanceFromProfile(
        store.profileList.selectedProfile
      );
    } else {
      this.profileForm = pf.getInstance();
    }
    this.subForms = pf.subforms;
  }

  renderMenu() {
    const menuBtns = [];
    Subforms.forms.forEach((formStr) => {
      const subForm = this.profileForm[formStr];
      menuBtns.push(
        <Button
          active={this.state.selectedSubform == subForm.name}
          onClick={() => {
            this.setState({
              selectedSubform: subForm.name
            });
          }}
        >
          {subForm.name}
        </Button>
      );
    });

    return (
      <div>
        <ButtonGroup minimal={false} large vertical fill>
          {menuBtns}
        </ButtonGroup>
      </div>
    );
  }

  render() {
    const { store } = this.props;
    return (
      <div className="ProfileManager">
        <ReactGridLayout className="layout" rowHeight={150}>
          <div
            key="column0"
            data-grid={{ x: 0, y: 1.5, w: 3, h: 3, static: true }}
          >
            {this.renderMenu()}
          </div>
          <div
            key="column1"
            data-grid={{ x: 3, y: 1.5, w: 3, h: 3, static: true }}
          >
            <span className="text">2 - Static</span>
          </div>
          <div
            key="column2"
            data-grid={{ x: 6, y: 1.5, w: 3, h: 3, static: true }}
          >
            <span className="text">3 - Static</span>
          </div>
          <div
            key="column3"
            data-grid={{ x: 9, y: 1.5, w: 3, h: 3, static: true }}
          >
            <span className="text">4 - Static</span>
          </div>
        </ReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={() => store.hideConnectionPane()}
        />
      </div>
    );
  }
}
