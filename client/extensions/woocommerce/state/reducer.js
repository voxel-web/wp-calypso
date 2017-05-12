/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import ui from './ui/reducer';
import settings from './settings/reducer';

export default combineReducers( {
	ui,
	settings,
} );
