import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nutritrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nutritrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nutritrack_user');
    }
  }, [user]);

  const login = (email, role = 'USER', name = null) => {
    const displayName = name || email.split('@')[0];
    setUser({
      email,
      name: displayName,
      role,
    });
  };

  const register = (name, email) => {
    setUser({
      email,
      name,
      role: 'USER',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);