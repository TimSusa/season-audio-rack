
import { combineReducers } from 'redux'
import * as todoReducder from './todo'
import * as rackReducer from './rack'

export default combineReducers({
  ...todoReducder,
  ...rackReducer
})
