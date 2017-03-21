import MobxReactForm from 'mobx-react-form';

export default class ProfileForm extends MobxReactForm {

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

    this.connect(formValues);
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
