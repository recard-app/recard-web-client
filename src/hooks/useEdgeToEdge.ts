import { useContext, createContext, useEffect } from 'react';

interface EdgeToEdgeContextType {
  setEdgeToEdge: (edgeToEdge: boolean) => void;
}

export const EdgeToEdgeContext = createContext<EdgeToEdgeContextType | null>(null);

export const useEdgeToEdge = (edgeToEdge: boolean = true) => {
  const context = useContext(EdgeToEdgeContext);

  useEffect(() => {
    if (context) {
      context.setEdgeToEdge(edgeToEdge);

      // Cleanup on unmount
      return () => {
        context.setEdgeToEdge(false);
      };
    }
  }, [context, edgeToEdge]);
};
