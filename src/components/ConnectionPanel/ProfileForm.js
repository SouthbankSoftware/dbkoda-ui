import MobxReactForm from 'mobx-react-form';

export default class ProfileForm extends MobxReactForm {

  static mongoProtocol = 'mongodb://';

  onInit() {
    // this.$('hostRadio').observe({
    //   key: 'value', // can be any field property
    //   call: ({form, field, change}) => {
    //     console.log('xxxx');
    //   }, // set new value here
    // });
  }

  onSuccess(form) {
    const formValues = form.values();
    let connectionUrl;
    if (formValues.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + formValues.host + ':' + formValues.port;
    } else if (formValues.urlRadio) {
      connectionUrl = formValues.url;
    }
    if (formValues.sha) {
      const split = connectionUrl.split(ProfileForm.mongoProtocol);
      connectionUrl = ProfileForm.mongoProtocol + formValues.username + ':' + formValues.password + '@' + split[1];
    }

    this.connect({url: connectionUrl, database: formValues.database, authorization: true, test: false, alias: formValues.alias});
  }

  onTest(form) {
    console.log('click test', form);
  }

  onError(form) {
    // get all form errors
    console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
  }

  // plugins() {
  //   return {
  //     dvr: {
  //       package: validatorjs,
  //     },
  //   };
  // }

}
