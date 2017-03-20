import MobxReactForm from 'mobx-react-form';

export default class ProfileForm extends MobxReactForm {

  // plugins() {
  //   return {
  //     dvr: {
  //       package: validatorjs,
  //     },
  //   };
  // }

  onSuccess(form) {
    alert('Form is valid! Send the request here.');
    // get field values
    console.log('Form Values!', form.values());
  }

  onError(form) {
    // get all form errors
    console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
  }
}
