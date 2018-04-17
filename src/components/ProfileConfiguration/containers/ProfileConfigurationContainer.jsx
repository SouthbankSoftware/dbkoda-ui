import {inject, observer} from 'mobx-react';
import ProfileConfiguration from '../components/ProfileConfigurationComponent';

const ProfileConfigurationContainer = inject(allStores => ({
  api: allStores.store.api,
  store: allStores.store,
}))(observer(ProfileConfiguration));
export default ProfileConfigurationContainer;
