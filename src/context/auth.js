import { createContext, useContext, useState, useEffect } from "react";
import authService from "../api/services/auth.service";
import usersService from "../api/services/users.service";
import toast from 'react-hot-toast';
import { getErrorMessage } from "../lib/errorHandler";

const AuthContext = createContext(null);

export const AuthProvider = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await usersService.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired - clear auth
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      // Call login API
      await authService.login(email, password);

      // Fetch user data
      const userData = await usersService.getMe();
      setUser(userData);

      toast.success('Welcome back!');
      return userData;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      // Call register API
      await authService.register(userData);

      // Fetch user data
      const user = await usersService.getMe();
      setUser(user);

      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Login with Google OAuth credential
   */
  const loginWithGoogle = async (credential) => {
    try {
      await authService.googleAuth(credential);
      const userData = await usersService.getMe();
      setUser(userData);
      toast.success('Welcome back!');
      return userData;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Logout - clear all auth data
   */
  const logout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    } finally {
      setUser(null);
    }
  };

  /**
   * Update user data (for profile updates)
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, register, logout, updateUser, loading }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
