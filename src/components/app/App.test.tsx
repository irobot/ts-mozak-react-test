import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {store} from '../../redux/store';

it('renders without crashing', () => {
  const div = document.createElement('div');
  // TODO: div#dummy > App
  ReactDOM.render(<Provider store={store}><div id="dummy"/></Provider>, div);
});
