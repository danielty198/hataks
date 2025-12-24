import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);
const COOKIE_USER = 'hataks';

const parseVal = (val) => {
  try {
    return JSON.parse(val);
  } catch (error) {
    return val;
  }
};

const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return parseVal(cookieValue);
    }
  }
  return null;
};

const setCookieRaw = (name, value, days = 7) => {
  const val = typeof value !== 'string' ? JSON.stringify(value) : value;
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${expirationDate.toUTCString()}`;
  document.cookie = `${name}=${val}; ${expires}; path=/`;
};

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => getCookie(COOKIE_USER));

  const setUser = (newUser) => {
    setCookieRaw(COOKIE_USER, newUser);
    setUserState(newUser);
  };

  const deleteUser = () => {
    setCookieRaw(COOKIE_USER, '', 0);
    setUserState(null);
  };

  return (
    <UserContext.Provider value={[user, setUser, deleteUser]}>
      {children}
    </UserContext.Provider>
  );
}

export default function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}