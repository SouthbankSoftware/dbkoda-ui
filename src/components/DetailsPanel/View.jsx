/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T14:42:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-30T15:01:58+10:00
 */


import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import TableField from './Components/TableField';
import BarChartField from './Components/BarChartField';
import PieChartField from './Components/PieChartField';

import './View.scss';

@inject('store')
@observer
export default class DetailsView extends React.Component {
  @action.bound
  close(e) {
    e.preventDefault();
    // const editor = this.props.store.editors.get(
    //   this.props.store.detailsPanel.activeEditorId
    // );
    // this.props.store.editors.set(this.props.store.detailsPanel.activeEditorId, {
    //   ...editor,
    //   detailsView: {visible: false}
    // });
    this.props.store.detailsPanel.activeEditorId = '';
  }
  render() {
    const { title, viewInfo } = this.props;
    const detailsFields = [];
    const fldGroups = {};
    if (viewInfo && viewInfo.fields.length > 0) {
      for (const field of viewInfo.fields) {
        if (viewInfo.values[field.name]) {
          const fieldData = viewInfo.values[field.name];
          let fld;
          if (field.type == 'Table') {
            fld = (<TableField key={field.name} field={field} data={fieldData} />);
          } else if (field.type == 'BarChart') {
            fld = (<BarChartField key={field.name} field={field} data={fieldData} />);
          } else if (field.type == 'PieChart') {
            fld = (<PieChartField key={field.name} field={field} data={fieldData} />);
          }

          if (field.groupBy) {
            if (fldGroups[field.groupBy]) {
              fldGroups[field.groupBy].push(fld);
            } else {
              fldGroups[field.groupBy] = [];
              fldGroups[field.groupBy].push(fld);
              const grpDiv = (<div style={field.width && { width: field.width }}>{fldGroups[field.groupBy]}</div>);
              detailsFields.push(grpDiv);
            }
          } else {
            detailsFields.push(fld);
          }
        }
      }
    }
    return (
      <div className="pt-dark ">
        <p className="details-title">{title}</p>
        <div className="details-fields">
          {detailsFields}
        </div>
        {/* <div className="form-button-panel">
          <button
            className="pt-button pt-intent-primary right-button"
            onClick={this.close}
          >
            Close
          </button>
        </div>*/}
      </div>
    );
  }
}
