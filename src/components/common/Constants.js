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
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-15T12:03:27+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T09:31:51+10:00
*/



export const DragItemTypes = {
  LABEL: 'label',
  VISUAL_BLOCK: 'visual_block'
};

export const ProfileStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

export const DrawerPanes = {
  DEFAULT: 'default',
  PROFILE: 'profile',
  DYNAMIC: 'dynamic',
  BACKUP_RESTORE: 'backup-restore',
  AGGREGATE: 'aggregate'
};

export const BackupRestoreActions = {
  EXPORT_DATABASE: 'ExportDatabase',
  DUMP_DATABASE: 'DumpDatabase',
  EXPORT_COLLECTION: 'ExportCollection',
  DUMP_COLLECTION: 'DumpCollection',
  DUMP_SERVER: 'DumpServer',
  IMPORT_DATABASE: 'ImportDatabase',
  IMPORT_COLLECTION: 'ImportCollection',
  RESTORE_DATABASE: 'RestoreDatabase',
  RESTORE_COLLECTION: 'RestoreCollection',
  RESTORE_SERVER: 'RestoreServer',
};
