import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slice/userslice';
import travelReducer from './slice/travelSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    travel: travelReducer,
  },
});