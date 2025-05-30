import { useContext, createContext, useEffect } from 'react';

interface FullHeightContextType {
  setFullHeight: (fullHeight: boolean) => void;
}

export const FullHeightContext = createContext<FullHeightContextType | null>(null);

export const useFullHeight = (fullHeight: boolean = true) => {
  const context = useContext(FullHeightContext);
  
  useEffect(() => {
    if (context) {
      context.setFullHeight(fullHeight);
      
      // Cleanup on unmount
      return () => {
        context.setFullHeight(false);
      };
    }
  }, [context, fullHeight]);
}; 