import { useState } from 'react';

export const parseVal = (val) => {
  try {
    return JSON.parse(val);
  } catch (error) {
    return val;
  }
};

export const getCookies = () => {
  return document.cookie.split(';').map((cookie) => {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    return {
      [cookieName]: parseVal(cookieValue)
    };
  });
};

export const useCookie = (name) => {
  const setCookie = (value, days = 7) => {
    const val = typeof value !== 'string' ? JSON.stringify(value) : value;
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${expirationDate.toUTCString()}`;
    document.cookie = `${name}=${val}; ${expires}; path=/`;
    setCurrentCookie(value);
  };

  const getCookie = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return parseVal(cookieValue);
      }
    }
    return null;
  };

  const deleteCookie = () => {
    setCookie('', 0);
  };

  const [cookie, setCurrentCookie] = useState(getCookie());
  
  return [cookie, setCookie, deleteCookie];
};