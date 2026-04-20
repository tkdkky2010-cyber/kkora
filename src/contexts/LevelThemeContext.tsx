import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LevelTheme } from '../constants/levels';

const STORAGE_KEY = '@kkora/levelTheme';

interface LevelThemeContextValue {
  theme: LevelTheme;
  setTheme: (t: LevelTheme) => void;
}

const LevelThemeContext = createContext<LevelThemeContextValue>({
  theme: 'v1',
  setTheme: () => {},
});

export function LevelThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<LevelTheme>('v1');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'v1' || v === 'v2') setThemeState(v);
      })
      .catch(() => {});
  }, []);

  const setTheme = useCallback((t: LevelTheme) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  }, []);

  return (
    <LevelThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </LevelThemeContext.Provider>
  );
}

export function useLevelTheme(): LevelThemeContextValue {
  return useContext(LevelThemeContext);
}
