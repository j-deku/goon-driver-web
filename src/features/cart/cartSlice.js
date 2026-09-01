import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [], // array of ride objects, each with an added `requestedSeats` field
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    addToCart: (state, action) => {
      // payload: full ride object
      state.cartItems.push({ ...action.payload, requestedSeats: 1 });
    },
    updateRequestedSeats: (state, action) => {
      // payload: { rideId, seats }
      const { rideId, seats } = action.payload;
      const item = state.cartItems.find(r => r.id === rideId);
      if (item) item.requestedSeats = seats;
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  setCartItems,
  addToCart,
  updateRequestedSeats,
  removeFromCart,
  clearCart
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;

export default cartSlice.reducer;
