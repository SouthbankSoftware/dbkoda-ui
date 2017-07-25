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
                content={o.tooltips}
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

export const ExportDBOptions = ({ssl, allCollections, pretty, jsonArray, changeSSL, changeAllCollections, changePretty, changeJsonArray}) => {
  const options = [
    {
      id: 0,
      label: globalString('backup/database/allCollections'),
      onChange: changeAllCollections,
      tooltips: '',
      checked: allCollections
    },
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
      tooltips: '',
    },
    {
      id: 2,
      label: globalString('backup/database/pretty'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty
    },
    {
      id: 3,
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      tooltips: '',
      checked: jsonArray
    }
  ];
  return getOptions(options);
};

export const ExportCollectionOptions = ({ssl, pretty, jsonArray, changeSSL, changePretty, changeJsonArray}) => {
  const options = [
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
      tooltips: '',
    },
    {
      id: 2,
      label: globalString('backup/database/pretty'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty
    },
    {
      id: 3,
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      tooltips: '',
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
      tooltips: '',
      checked: ssl,
    }, {
      id: 2,
      label: 'gzip',
      onChange: changeGZip,
      tooltips: '',
      checked: gzip,
    }, {
      id: 3,
      label: globalString('backup/database/repair'),
      onChange: changeRepair,
      tooltips: '',
      checked: repair,
    }, {
      id: 4,
      label: 'dumpDbUsersAndRoles',
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: '',
    }, {
      id: 5,
      label: 'viewsAsCollections',
      checked: viewsAsCollections,
      tooltips: '',
      onChange: changeViewsAsCollections,
    }
  ];
  return getOptions(options);
};

/**
 * the option panel for database export
 * @constructor
 */
export const Options = ({action, ssl, allCollections, pretty, jsonArray, changeSSL, changeAllCollections, changePretty, changeJsonArray}) => {
  if (action === BackupRestoreActions.EXPORT_DATABASE || action === BackupRestoreActions.EXPORT_COLLECTION) {
    return ExportDBOptions({
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

