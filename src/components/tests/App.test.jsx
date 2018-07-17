/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-04T15:54:56+10:00
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

import '~/stores/global';
import React from 'react';
import '~/helpers/configEnzyme';
import { shallow } from 'enzyme';
import { observable, configure } from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import App from '#/App';

describe('App', () => {
  let app;
  const layout = observable({
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%'
  });

  beforeAll(() => {
    configure({ enforceActions: true });
    globalizeInit();
    app = shallow(
      <App.wrappedComponent
        store={{
          password: { showDialog: false, verifyPassword: false },
          editorPanel: { showNewFeaturesDialog: false }
        }}
        configStore={{ config: { showNewFeaturesDialogOnStart: false } }}
        layout={layout}
      />
    );
  });

  test('has no split panels', () => {
    expect(app.find('SplitPane').length).toEqual(0);
  });
});
