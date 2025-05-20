import { useState, useEffect } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface UseModalOptions {
  initialState?: boolean;
  modalType?: string;
  entityId?: string;
  disableEscapeClose?: boolean;
}

export const useModal = (options: UseModalOptions = {}): UseModalReturn => {
  const {
    initialState = false,
    modalType,
    entityId,
    disableEscapeClose = false
  } = options;

  // Construct the full modal ID from type and entity ID
  const getModalId = (): string | undefined => {
    if (modalType && entityId) {
      return `${modalType}_${entityId}`;
    }
    return undefined;
  };
  
  const modalId = getModalId();

  // Check sessionStorage for persisted state if modalId is provided
  const getInitialState = (): boolean => {
    if (modalId) {
      const storedState = sessionStorage.getItem(`modal_${modalId}`);
      return storedState === 'true' ? true : initialState;
    }
    return initialState;
  };

  const [isOpen, setIsOpen] = useState<boolean>(getInitialState());

  // Persist state changes to sessionStorage if modalId is provided
  useEffect(() => {
    if (modalId) {
      if (isOpen) {
        sessionStorage.setItem(`modal_${modalId}`, 'true');
      } else {
        sessionStorage.removeItem(`modal_${modalId}`);
      }
    }
  }, [isOpen, modalId]);

  const open = () => setIsOpen(true);
  
  const close = () => {
    setIsOpen(false);
    if (modalId) {
      sessionStorage.removeItem(`modal_${modalId}`);
    }
  };
  
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

export default useModal; 