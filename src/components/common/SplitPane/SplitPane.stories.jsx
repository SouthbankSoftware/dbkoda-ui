/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T11:55:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-23T16:16:22+10:00
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
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import '#/App.scss';
import SplitPane from './';

storiesOf('SplitPane', module)
  .addDecorator(withKnobs)
  .add(
    'normal',
    () => (
      <SplitPane
        split="vertical"
        minSize={number('minSize', 50)}
        defaultSize={number('defaultSize', 100)}
      >
        <div>{text('test1', 'test1')}</div>
        <div>{text('test2', 'test2')}</div>
      </SplitPane>
    ),
    { notes: 'As you can see this is just a boring split panel. No magic is happening yet.' }
  );
