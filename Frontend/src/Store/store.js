import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import travelReducer from './slices/travelSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    travel: travelReducer,
  },
});