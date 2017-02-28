import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import {ENV} from './env';

console.log('working on ', ENV);
ReactDOM.render(<App />, document.getElementById('root'));
