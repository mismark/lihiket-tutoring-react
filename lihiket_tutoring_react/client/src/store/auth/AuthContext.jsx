import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Bump this version whenever the user object shape changes.
// Old sessions with a different version will be cleared automatically.
const AUTH_VERSION = '2';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from localStorage on first mount
  useEffect(() => {
    const storedVersion = localStorage.getItem('auth_version');
    const storedToken   = localStorage.getItem('token');
    const storedUser    = localStorage.getItem('user');

    // Clear everything if version mismatch (forces clean re-login)
    if (storedVersion !== AUTH_VERSION) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('auth_version', AUTH_VERSION);
      setLoading(false);
      return;
    }

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Validate essential fields — must have an id AND a role
        if (parsed && (parsed.id || parsed._id) && parsed.role) {
          setUser(parsed);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []); // run once on mount

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_version', AUTH_VERSION);
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
