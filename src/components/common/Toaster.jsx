/**
 * @Author: mike
 * @Date:   2017-02-15 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:22:02
 */
import {Position, Toaster} from '@blueprintjs/core';

export const NewToaster = Toaster.create({className: 'my-toaster', position: Position.TOP_RIGHT});

export const DBenvyToaster = () => {
  return Toaster.create({className: 'dbenvy-toaster', position: Position.TOP_RIGHT});
};
