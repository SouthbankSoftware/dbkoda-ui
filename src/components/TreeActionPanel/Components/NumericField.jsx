/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-09T16:07:17+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T16:00:38+10:00
 */



 /**
  * @Author: Wahaj Shamim <wahaj>
  * @Date:   2017-04-19T15:43:32+10:00
  * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T16:00:38+10:00
  */

 import React from 'react';
 import { observer } from 'mobx-react';

 import { Intent, Position, Tooltip, NumericInput } from '@blueprintjs/core';

 export default observer(({
   field,
   showLabel = true,
   formGroup = false
 }) => {
   const fldClassName = formGroup
     ? 'pt-form-group form-group-inline'
     : 'pt-form-group pt-top-level';
   let inputClassName = '';
   let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
   if (formGroup) {
     if (field.options && field.options.tooltip) {
       tooltipClassName += ' table-field-80';
       inputClassName += ' table-field-100';
     } else {
       inputClassName += ' table-field-80';
     }
   }
   return (
     <div className={fldClassName}>
       {showLabel &&
         <label className="pt-label pt-label-r-30" htmlFor={field.id}>
           {field.label}
         </label>}
       <div className="pt-form-content">
         {field.options &&
           field.options.tooltip &&
           <Tooltip
             className={tooltipClassName}
             content={field.options.tooltip}
             hoverOpenDelay={1000}
             inline
             intent={Intent.PRIMARY}
             position={Position.TOP}
           >
             <NumericInput className={inputClassName} min={field.options.min} max={field.options.max} {...field.bind()} />
           </Tooltip>}
         {(!field.options || !field.options.tooltip) &&
           <NumericInput className={inputClassName} min={field.options.min} max={field.options.max} {...field.bind()} />}
         <p className="pt-form-helper-text">{field.error}</p>
       </div>
     </div>
   );
 });
