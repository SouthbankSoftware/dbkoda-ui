/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-11T14:18:05+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-13T01:10:44+10:00
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
import { withProps } from 'recompose';
import Icon from '~/styles/icons/color/editor-icon.svg';
import ConfigEntry from './ConfigEntry';
import MenuEntry from './MenuEntry';
import './EditorConfigPanel.scss';

const paths = {
  fontFamily: 'config.editor.fontFamily',
  fontSize: 'config.editor.fontSize',
  fontWeight: 'config.editor.fontWeight',
  lineHeight: 'config.editor.lineHeight'
};

const MenuIcon = <Icon id="editor-icon" />;

export const EditorMenuEntry = withProps({ icon: MenuIcon, paths })(MenuEntry);

// $FlowIssue
@inject(({ api }) => ({
  api
}))
@observer
export default class EditorConfigPanel extends React.Component<*> {
  render() {
    return (
      <div className="EditorConfigPanel">
        <div className="MainColumn">
          <ConfigEntry path={paths.fontFamily} />
          <ConfigEntry path={paths.fontSize} />
          <ConfigEntry path={paths.fontWeight} />
          <ConfigEntry path={paths.lineHeight} />
        </div>
        <div className="SecondaryColumn" />
      </div>
    );
  }
}
