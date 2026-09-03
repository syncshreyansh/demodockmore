import React, { createContext, useContext } from 'react';

const IntroContext = createContext({
  introComplete: true,
});

export const IntroProvider = IntroContext.Provider;

export function useIntro() {
  return useContext(IntroContext);
}

export default IntroContext;
