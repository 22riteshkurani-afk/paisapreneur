import { createContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Validate token by fetching user info
          try {
            const response = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              localStorage.removeItem("refresh_token");
              setToken(null);
              setUser(null);
            }
          } catch (err) {
            console.error("Token validation failed:", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async (googleToken) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      
      // Store tokens and user
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return data.user;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh access token
  const refreshToken = useCallback(async () => {
    try {
      const refreshTok = localStorage.getItem("refresh_token");
      if (!refreshTok) {
        throw new Error("No refresh token available");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshTok}`,
        },
      });

      if (!response.ok) {
        // Refresh failed, logout user
        logout();
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return data.access_token;
    } catch (err) {
      console.error("Token refresh error:", err);
      logout();
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    error,
    loginWithGoogle,
    refreshToken,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
