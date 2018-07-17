/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-10T15:32:22+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-17T14:55:27+10:00
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

import _ from 'lodash';
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from '@blueprintjs/core';
import { NavPanes } from '#/common/Constants';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { DialogHotkeys } from '#/common/hotkeys/hotkeyList';
import WelcomeConfigPanel, { WelcomeMenuEntry } from './WelcomeConfigPanel';
import GeneralConfigPanel, { GeneralMenuEntry } from './GeneralConfigPanel';
import PathsConfigPanel, { PathsMenuEntry } from './PathsConfigPanel';
import PerformanceLabConfigPanel, { PerformanceLabMenuEntry } from './PerformanceLabConfigPanel';
import EditorConfigPanel, { EditorMenuEntry } from './EditorConfigPanel';
import PasswordStoreConfigPanel, { PasswordStoreMenuEntry } from './PasswordStoreConfigPanel';
import ShortcutsConfigPanel, { ShortcutsMenuEntry } from './ShortcutsConfigPanel';
import './Panel.scss';

// IMPORTANT: this should be kept consistent with globalString('config/menu/*')
export const manifest = {
  welcome: {
    menuEntry: WelcomeMenuEntry,
    configPanel: WelcomeConfigPanel
  },
  general: {
    menuEntry: GeneralMenuEntry,
    configPanel: GeneralConfigPanel
  },
  paths: {
    menuEntry: PathsMenuEntry,
    configPanel: PathsConfigPanel
  },
  performanceLab: {
    menuEntry: PerformanceLabMenuEntry,
    configPanel: PerformanceLabConfigPanel
  },
  editor: {
    menuEntry: EditorMenuEntry,
    configPanel: EditorConfigPanel
  },
  passwordStore: {
    menuEntry: PasswordStoreMenuEntry,
    configPanel: PasswordStoreConfigPanel
  },
  shortcuts: {
    menuEntry: ShortcutsMenuEntry,
    configPanel: ShortcutsConfigPanel
  }
};

// $FlowIssue
@inject(({ store: { setActiveNavPane, configPanel }, api }) => ({
  store: {
    configPanel
  },
  setActiveNavPane,
  api
}))
@observer
export default class ConfigPanel extends React.Component<*> {
  _closePanel = () => {
    const { setActiveNavPane } = this.props;

    setActiveNavPane(NavPanes.EDITOR);
  };

  componentDidMount() {
    // $FlowFixMe
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, this._closePanel);
  }

  componentWillUnmount() {
    // $FlowFixMe
    Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, this._closePanel);
  }

  render() {
    const {
      store: {
        configPanel: { currentMenuEntry }
      }
    } = this.props;
    const { configPanel: SelectedConfigPanel } = manifest[currentMenuEntry];

    return (
      <div className="ConfigPanel">
        <div className="LeftPanel">
          <div className="CurrentMenuEntryName">
            {globalString(`config/menu/${currentMenuEntry}`)}
          </div>
          <div className="Menu">
            {_.map(manifest, (v, k) => {
              const MenuEntry = v.menuEntry;

              return <MenuEntry key={k} name={k} />;
            })}
          </div>
        </div>
        <div className="MainPanel">
          <SelectedConfigPanel />
        </div>
        <Button
          className="CloseBtn pt-button pt-intent-primary"
          text="X"
          onClick={this._closePanel}
        />
      </div>
    );
  }
}
