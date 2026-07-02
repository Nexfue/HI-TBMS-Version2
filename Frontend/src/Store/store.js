import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userslice';
import travelReducer from './slices/travelSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    travel: travelReducer,
  },
});

export default store;