import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChallengeState {
  isActive: boolean;
  challengeId: string | null;
  gracesUsed: number;
}

interface ChallengeContextType {
  challenge: ChallengeState;
  startChallenge: (challengeId: string) => void;
  updateGraces: (count: number) => void;
  endChallenge: () => void;
}

const defaultState: ChallengeState = {
  isActive: false,
  challengeId: null,
  gracesUsed: 0,
};

const ChallengeContext = createContext<ChallengeContextType | null>(null);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const [challenge, setChallenge] = useState<ChallengeState>(defaultState);

  const startChallenge = useCallback((challengeId: string) => {
    setChallenge({
      isActive: true,
      challengeId,
      gracesUsed: 0,
    });
  }, []);

  const updateGraces = useCallback((count: number) => {
    setChallenge((prev) => ({ ...prev, gracesUsed: count }));
  }, []);

  const endChallenge = useCallback(() => {
    setChallenge(defaultState);
  }, []);

  return (
    <ChallengeContext.Provider value={{ challenge, startChallenge, updateGraces, endChallenge }}>
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge(): ChallengeContextType {
  const context = useContext(ChallengeContext);
  if (context === null) {
    throw new Error('useChallenge must be used within ChallengeProvider');
  }
  return context;
}
