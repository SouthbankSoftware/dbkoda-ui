import React from 'react';
import {createForm} from './ProfileForm';
import Panel from './Panel';
import {inject, observer} from 'mobx-react';
import {Intent, Position} from '@blueprintjs/core';
import {featherClient} from '../../helpers/feathers';
import {DBenvyToaster} from '../common/Toaster';

const form = createForm();

const Creator = ({profiles}) => {

  const connect = (data) => {
    return featherClient()
      .service('/mongo-connection')
      .create({}, {
        query: data
      })
      .then((res) => {
        console.log('get response', res);
        let message = 'Connection Success!';
        let position = Position.LEFT_BOTTOM;
        if (!data.test) {
          position = Position.RIGHT_TOP;
          form.reset();
          profiles
            .set(res.id, {...data, shellId: res.shellId, password: '******', status: 'OPEN'});
        } else {
          message = 'Test ' + message;
        }
        DBenvyToaster(position).show({
          message,
          intent: Intent.SUCCESS,
          iconName: 'pt-icon-thumbs-up'
        });
      });

  }

  return (
    <Panel form={form} connect={connect}/>
  );
}

export default inject(allStores => ({
  profiles: allStores.store.profiles,
}))(observer(Creator));
