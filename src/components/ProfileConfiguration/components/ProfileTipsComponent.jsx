/**
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
import TipsCard from './TipsCard';

const tips = [
  {
    content:
      'The database profiler collects detailed information about Database Commands executed against a running mongod instance. This includes CRUD operations as well as configuration and administration commands. The profiler writes all the data it collects to the system.profile collection, a capped collection in the admin database. See Database Profiler Output for an overview of the system.profile documents created by the profiler.'
  },
  {
    content:
      'The profiler is off by default. You can enable the profiler on a per-database or per-instance basis at one of several profiling levels.'
  }
];

export default () => {
  return <TipsCard tips={tips} />;
};
