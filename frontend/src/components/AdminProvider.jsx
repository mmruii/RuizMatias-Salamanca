import { createContext, useContext, useEffect, useState } from 'react';
import { getAdminSession, loginAdmin, logoutAdmin } from '../services/admin.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getAdminSession(controller.signal)
      .then((session) => {
        if (!controller.signal.aborted) setAuthenticated(session.authenticated);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAuthenticated(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);

  async function login(username, password) {
    setSigningIn(true);
    try {
      const session = await loginAdmin(username, password);
      setAuthenticated(session.authenticated);
    } finally {
      setSigningIn(false);
    }
  }

  async function logout() {
    await logoutAdmin();
    setAuthenticated(false);
  }

  return (
    <AdminContext.Provider
      value={{
        authenticated,
        checking,
        signingIn,
        login,
        logout,
        expire: () => setAuthenticated(false),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
