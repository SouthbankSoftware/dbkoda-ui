/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T11:55:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-11T14:31:03+10:00
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
import 'regenerator-runtime/runtime';
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
// import { withKnobs, text, number, select, boolean, array } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
import '~/helpers/storybook/styles.scss';

import { en as globalStrings } from '~/messages/en.json';
import StoreLoader from '~/helpers/storybook/StoreLoader';
import ConfigPanel from './Panel';
import PathsConfigPanel from './PathsConfigPanel';

global.globalString = (path: string) => {
  return _.get(globalStrings, path.split('/'));
};

storiesOf('ConfigPanel', module)
  .addDecorator(withKnobs)
  .add('PathsConfigPanel', () => (
    <StoreLoader>
      <PathsConfigPanel />
    </StoreLoader>
  ))
  .add('ConfigPanel', () => (
    <StoreLoader>
      <ConfigPanel />
    </StoreLoader>
  ));
