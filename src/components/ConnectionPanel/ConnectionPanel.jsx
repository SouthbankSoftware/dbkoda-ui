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
 *
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-30T09:57:22+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-19T11:50:06+11:00
 */

/**
 * create new profile form and handle connection
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Position } from '@blueprintjs/core';
import { createForm } from './ProfileForm';
import Panel from './Panel';
import { DBKodaToaster } from '../common/Toaster';

const ConnectionPanel = ({
  api,
  store,
  profiles,
  profileList
}) => {
  const { selectedProfile } = profileList;
  let edit = false;
  if (profileList.selectedProfile) {
    edit = true;
  }
  const form = createForm(selectedProfile);

  const showToaster = (strErrorCode, err) => {
    switch (strErrorCode) {
      case 'existingAlias':
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: globalString('connection/existingAlias'),
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      break;
      case 'connectionFail':
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: (<span dangerouslySetInnerHTML={{ __html: 'Error: ' + err.message.substring(0, 256) + '...' }} />), // eslint-disable-line react/no-danger
          className: 'danger',
          iconName: 'pt-icon-thumbs-down',
        });
      break;
      case 'connectionSuccess':
        DBKodaToaster(Position.RIGHT_TOP).show({
          message: globalString('connection/success'),
          className: 'success',
          iconName: 'pt-icon-thumbs-up'
        });
      break;
      default:
      break;
    }
  };
  api.setToasterCallback(showToaster);

  return (
    <Panel
      form={form}
      close={store.hideConnectionPane}
      edit={edit}
      connect={api.connectProfile}
      profiles={profiles}
      save={api.saveProfile}
      title={
        edit ? globalString('connection/editHeading') : globalString('connection/createHeading')
      }
    />
  );
};

export default inject(allStores => ({
  api: allStores.api,
  store: allStores.store,
  profiles: allStores.profileStore.profiles,
  profileList: allStores.store.profileList
}))(observer(ConnectionPanel));
