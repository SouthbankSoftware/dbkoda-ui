import React from 'react';
import './style.scss';


const ExplainCommandInfo = ({explain, command}) => {
  console.log('command info ', explain, command);
  return (
    <div className="explain-command-info">
      <ul>
        <li className="label">
          NameSpace:
        </li>
        <li className="label">Query Command:</li>
      </ul>
      <ul>
        <li>{explain.queryPlanner.namespace}</li>
        <li>{command}</li>
      </ul>
    </div>
  );
};

const ExplainView = ({explains}) => {
  if (!explains.output) {
    return null;
  }
  console.log('explains:', explains);
  const output = JSON.parse(explains.output);
  console.log('output:', output);
  return (<div className="explain-view-panel">
    <ExplainCommandInfo explain={output} command={explains.command} />
    <table className="pt-table">
      <tr>
        <td>Document Returned:</td>
      </tr>
      <tr>
        <td>Index Keys Examined:</td>
      </tr>
      <tr>
        <td>Technologies:</td>
      </tr>
    </table>
  </div>);
};

ExplainView.propTypes = {
  explains: React.PropTypes.object.isRequired,
};

ExplainView.defaultProps = {
  explains: {},
};


export default ExplainView;
