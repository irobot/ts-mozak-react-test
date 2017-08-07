/**
 * Test for ${NAME.capitalizeFirstLetter()}.tsx created by Yanko on 7/4/2017.
 */

import * as React from 'react';
import * as enzyme from 'enzyme';
import Viewer from './Viewer';

// Less typing > more typing
const $ = enzyme.shallow;

it( 'renders the correct thing', () => {
  const comp = $( <Viewer name="Jean Luc Picard"/> );
  expect( comp.find( '.viewer' ).text() ).toContain( 'Hello Jean Luc Picard' );
} );