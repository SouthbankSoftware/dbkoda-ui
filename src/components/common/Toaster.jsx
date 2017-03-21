// toaster.ts
import {Position, Toaster} from '@blueprintjs/core';

export const NewToaster = Toaster.create({className: 'my-toaster', position: Position.TOP_RIGHT});

export const DBenvyToaster = (position) => {
  return Toaster.create({className: 'dbenvy-toaster', position: position});
}
