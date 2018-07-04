/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-03T16:53:55+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-03T17:00:37+10:00
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

import * as d3 from 'd3';
import { initLoggingApi } from '~/helpers/loggingApi';

// because of buggy globalize, we have to separate this out
if (!IS_TEST) {
  initLoggingApi(['dbkoda-ui', `window-${global.WINDOW_NAME}`]);

  const Globalize = require('globalize'); // doesn't work well with import

  global.Globalize = Globalize;

  const { language, region } = Globalize.locale().attributes;

  global.locale = `${language}-${region}`;

  d3.formatDefaultLocale(require(`d3-format/locale/${locale}.json`)); // eslint-disable-line import/no-dynamic-require

  global.globalString = (path, ...params) => Globalize.messageFormatter(path)(...params);
  global.globalNumber = (value, config) => Globalize.numberFormatter(config)(value);
}
