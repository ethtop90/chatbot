// src/features/auth/authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getSimplifiedError } from "../../util";
import { APIService, altAPIService } from "../../util/APIService";
import { baseUrl } from "../../util/endpoints";
import { url } from "../../util/endpoints";
import axios from "axios";
import { isAuthenticated } from "../../components/general/sidebar";
import { config } from "process";

console.log(APIService);

export interface AuthState {
  loading: boolean;
  userData: any;
  access_token: any;
  verifiedStatus: boolean;
}

const initialState: AuthState = {
  loading: false,
  userData: {},
  access_token: undefined,
  verifiedStatus: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(socialRegister.pending, (state) => {
        state.loading = true;
      })
      .addCase(socialRegister.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userData = payload;
        state.token = payload.tokens;
      })
      .addCase(socialRegister.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.log(payload);
        state.userData = payload.userData;
        state.access_token = payload.access_token;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(socialLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(socialLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userData = payload.user;
        state.token = payload.tokens;
      })
      .addCase(socialLogin.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.access_token = {};
        state.userData = {};
      })
      .addCase(logoutUser.rejected, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(verifyUserEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUserEmail.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.verifiedStatus = true;
      })
      .addCase(verifyUserEmail.rejected, (state, { payload }) => {
        state.loading = false;
      });
  },
});

export const registerUser = createAsyncThunk(
  "registerUser",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await APIService.post(`${url.register}`, payload);
      if (data["status"] == "ok")
        localStorage.setItem("operation_status", "success");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const socialRegister = createAsyncThunk(
  "socialRegister",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await APIService.post(`${url.socialRegister}`, payload);
      localStorage.setItem("username", data.userData.username);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "loginUser",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await APIService.post(`${url.login}`, payload);
      if (data["status"] == "ok")
        localStorage.setItem("operation_status", "success");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const socialLogin = createAsyncThunk(
  "socialLogin",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await APIService.post(`${url.socialLogin}`, payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "logoutUser",
  async (payload: any, { rejectWithValue }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${payload.access_token}`,
      },
      // Add any other configuration options here
    };
    try {
      const { data } = await APIService.post(`${url.logout}`, payload, config);
      if (data["status"] == "ok") {
        localStorage.setItem("operation_status", "success");
        localStorage.removeItem("access_token");
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const verifyUserEmail = createAsyncThunk(
  "verifyUserEmail",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await APIService.post(
        `${url.verifyUserEmail}?${payload}`
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        getSimplifiedError(error.response ? error : error)
      );
    }
  }
);

export const authSelector = (state: any) => state.auth;

export const { clearState } = authSlice.actions;
export default authSlice.reducer;
