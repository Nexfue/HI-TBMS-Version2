import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import travelReducer from "./slices/travelSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    travel: travelReducer,
  },
});

export default store;