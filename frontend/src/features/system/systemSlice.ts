import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SystemState {
  success: boolean;
}

const initialState: SystemState = {
  success: false,
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    clearState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setSuccess.pending, (state) => {
        state.success = false;
      })
      .addCase(setSuccess.fulfilled, (state, { payload }) => {
        state.success = payload.success;
      })
      .addCase(setSuccess.rejected, (state, { payload }) => {
        state.success = false;
      });
  },
});

export const setSuccess = createAsyncThunk(
  "setSuccess",
  async (payload: any, { rejectWithValue }) => {
    try {
      console.log(payload);
      const data = { success:payload };
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const systemSelector = (state: any) => state.system;
export const { clearState } = systemSlice.actions;
export default systemSlice.reducer;
