import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to periodically check if the token has expired
 * and automatically log out the user if it has
 */
export const useTokenExpirationCheck = (checkInterval: number = 60000) => {
  const { token, handleTokenExpired } = useAuth();

  useEffect(() => {
    if (!token) return;

    const isTokenExpired = (token: string): boolean => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        return Date.now() >= expirationTime;
      } catch (error) {
        return true;
      }
    };

    // Check immediately
    if (isTokenExpired(token)) {
      handleTokenExpired();
      return;
    }

    // Set up periodic checking
    const intervalId = setInterval(() => {
      if (isTokenExpired(token)) {
        handleTokenExpired();
      }
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [token, handleTokenExpired, checkInterval]);
};
