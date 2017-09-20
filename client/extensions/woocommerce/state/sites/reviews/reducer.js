/**
 * External dependencies
 */
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	COMMENTS_CHANGE_STATUS,
	//COMMENTS_DELETE,
} from 'state/action-types';
import { getSerializedReviewsQuery } from './utils';
import {
	WOOCOMMERCE_REVIEWS_RECEIVE,
	WOOCOMMERCE_REVIEWS_REQUEST,
} from 'woocommerce/state/action-types';

/**
 * Returns if a reviews request for a specific query is in progress or not.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isQueryLoading( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_REVIEWS_REQUEST:
		case WOOCOMMERCE_REVIEWS_RECEIVE:
			const query = getSerializedReviewsQuery( action.query );
			return Object.assign( {}, state, { [ query ]: WOOCOMMERCE_REVIEWS_REQUEST === action.type } );
		default:
			return state;
	}
}

/**
 * Tracks all known reviews objects, indexed by ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	if ( action.error ) {
		return state;
	}

	if ( WOOCOMMERCE_REVIEWS_RECEIVE === action.type && action.reviews ) {
		const reviews = keyBy( action.reviews, 'id' );
		return Object.assign( {}, state, reviews );
	}

	if ( COMMENTS_CHANGE_STATUS === action.type && action.status ) {
		const status = 'unapproved' === action.status ? 'pending' : action.status;
		const itemToUpdate = {
			...state[ action.commentId ],
			status,
		};
		return {
			...state,
			[ action.commentId ]: itemToUpdate,
		};
	}

	return state;
}

/**
 * Returns if a reviews request for a specific query has returned an error.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isQueryError( state = {}, action ) {
	if ( WOOCOMMERCE_REVIEWS_RECEIVE === action.type && action.error ) {
		const query = getSerializedReviewsQuery( action.query );
		return Object.assign( {}, state, { [ query ]: true } );
	}

	return state;
}

/**
 * Tracks the reviews which belong to a query, as a list of IDs
 * referencing items in `reviews.items`.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries( state = {}, action ) {
	if ( WOOCOMMERCE_REVIEWS_RECEIVE === action.type && action.reviews ) {
		const idList = action.reviews.map( review => review.id );
		const query = getSerializedReviewsQuery( action.query );
		return Object.assign( {}, state, { [ query ]: idList } );
	}
	return state;
}

/**
 * Tracks the total number of reviews for the current query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function total( state = 0, action ) {
	if ( WOOCOMMERCE_REVIEWS_RECEIVE === action.type && action.reviews ) {
		const query = getSerializedReviewsQuery( omit( action.query, 'page' ) );
		return Object.assign( {}, state, { [ query ]: action.total } );
	}
	return state;
}

export default combineReducers( {
	isQueryLoading,
	isQueryError,
	items,
	queries,
	total,
} );
