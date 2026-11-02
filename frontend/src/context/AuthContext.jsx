
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("tejo_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("tejo_token") || null;
  });

  // Connect authenticated users to Socket.IO.
  useEffect(() => {
    if (!token) return;

    const socketUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

    const socket = io(socketUrl, {
      auth: {
        token,
      },
    });

    const forceLogout = (message) => {
      // Do not remove a newer token stored by another tab.
      const currentToken = localStorage.getItem("tejo_token");

      if (currentToken === token) {
        localStorage.removeItem("tejo_token");
        localStorage.removeItem("tejo_user");
      }

      sessionStorage.setItem(
        "tejo_session_message",
        message
      );

      setToken(null);
      setUser(null);

      socket.disconnect();

      window.location.replace("/login");
    };

    // Another device has logged into this account.
    socket.on("session:replaced", (data) => {
      forceLogout(
        data?.message ||
          "Your account has been logged in on another device. Please log in again."
      );
    });

    // Handle an invalid session during socket authentication.
    socket.on("connect_error", (error) => {
      if (
        error.message === "SESSION_REPLACED" ||
        error.message === "TOKEN_VERSION_MISMATCH"
      ) {
        forceLogout(
          "Your session is no longer valid. Please log in again."
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const {
      token: newToken,
      user: loggedInUser,
    } = response.data;

    localStorage.setItem("tejo_token", newToken);
    localStorage.setItem(
      "tejo_user",
      JSON.stringify(loggedInUser)
    );

    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem("tejo_token");
    localStorage.removeItem("tejo_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
