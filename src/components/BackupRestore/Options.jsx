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
 * Created by joey on 21/7/17.
 */

import React from 'react';
import {Checkbox, Intent, Position, Tooltip} from '@blueprintjs/core';
import {BackupRestoreActions} from '../common/Constants';

const getOptions = (options) => {
  return (
    <div className="options-panel">
      {
        options.map((o) => {
          return (
            <div className="option-item-row" key={o.id}>
              <Tooltip
                content=""
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.TOP}
              >
                <Checkbox
                  checked={o.checked}
                  label={o.label}
                  onChange={() => o.onChange()}
                />
              </Tooltip>
            </div>
          );
        })
      }
    </div>
  );
};

export const ExportOptions = ({ssl, allCollections, pretty, jsonArray, changeSSL, changeAllCollections, changePretty, changeJsonArray}) => {
  const options = [
    {
      id: 2,
      label: globalString('backup/database/allCollections'),
      onChange: changeAllCollections,
      checked: allCollections
    },
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
    },
    {
      id: 2,
      label: globalString('backup/database/pretty'),
      onChange: changePretty,
      checked: pretty
    },
    {
      id: 3,
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      checked: jsonArray
    }
  ];
  return getOptions(options);
};

export const DumpOptions = ({ssl, changeSSL, gzip, changeGZip, repair, changeRepair, allCollections, changeAllCollections,
                              oplog, changeOplog, dumpDbUsersAndRoles, changeDumpDbUsersAndRoles,
                              viewsAsCollections, changeViewsAsCollections}) => {
  const options = [
    {
      id: 0,
      label: globalString('backup/database/allCollections'),
      onChange: changeAllCollections,
      checked: allCollections
    },
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
    }, {
      id: 2,
      label: 'gzip',
      onChange: changeGZip,
      checked: gzip,
    }, {
      id: 3,
      label: globalString('backup/database/repair'),
      onChange: changeRepair,
      checked: repair,
    }, {
      id: 4,
      label: 'oplog',
      onChange: changeOplog,
      checked: oplog,
    }, {
      id: 5,
      label: 'dumpDbUsersAndRoles',
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
    }, {
      id: 6,
      label: 'viewsAsCollections',
      checked: viewsAsCollections,
      onChange: changeViewsAsCollections,
    }
  ];
  return getOptions(options);
};

/**
 * the option panel for database export
 * @constructor
 */
const Options = ({action, ssl, allCollections, pretty, jsonArray, changeSSL, changeAllCollections, changePretty, changeJsonArray}) => {
  if (action === BackupRestoreActions.EXPORT_DATABASE || action === BackupRestoreActions.EXPORT_COLLECTION) {
    return ExportOptions({
      ssl,
      allCollections,
      pretty,
      jsonArray,
      changeSSL,
      changeAllCollections,
      changePretty,
      changeJsonArray
    });
  }
  return null;
};

export default Options;
