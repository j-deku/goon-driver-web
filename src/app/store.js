import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import cartReducer from '../features/cart/cartSlice';
import adminReducer from '../features/admin/adminSlice';
import driverReducer from '../features/driver/driverSlice';
import driverNotificationsReducer from '../features/driver/driverNotificationsSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'cart', 'driverNotifications'], // persist user and cart only
};

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  admin: adminReducer,
  driver: driverReducer, // Assuming you have a driverReducer
  driverNotifications: driverNotificationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist recommends disabling this for persist
    }),
});
 
export default store;