import { useContext, createContext, useEffect } from 'react';

interface ScrollHeightContextType {
  setScrollHeight: (scrollHeight: boolean) => void;
}

export const ScrollHeightContext = createContext<ScrollHeightContextType | null>(null);

export const useScrollHeight = (scrollHeight: boolean = true) => {
  const context = useContext(ScrollHeightContext);
  
  useEffect(() => {
    if (context) {
      context.setScrollHeight(scrollHeight);
      
      // Cleanup on unmount
      return () => {
        context.setScrollHeight(false);
      };
    }
  }, [context, scrollHeight]);
}; 