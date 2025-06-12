/* ========================================================================
   LEGACY MODAL COMPONENT
   ========================================================================
   This is a legacy modal component that is no longer used.
   It is kept here for reference only.
   ======================================================================== */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Modal.scss';
import { useModal } from './useModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalType?: string; // Type of modal (e.g., 'delete', 'rename')
  entityId?: string; // ID of the entity the modal is related to
  modalId?: string; // Legacy support, will be deprecated
  width?: string; // Optional width parameter for the modal
  fullWidth?: boolean; // Optional prop to make modal take up 90% of screen width
  disableEscapeClose?: boolean; // Optional prop to disable closing on escape key
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen: externalIsOpen, 
  onClose, 
  children, 
  modalType,
  entityId,
  modalId: legacyModalId,
  width,
  fullWidth,
  disableEscapeClose = false
}) => {
  // Determine the modal ID to use - prefer new style, fall back to legacy
  const getModalId = (): string | undefined => {
    if (modalType && entityId) {
      return `${modalType}_${entityId}`;
    }
    return legacyModalId;
  };

  const modalId = getModalId();
  
  // Internal state that mirrors the external isOpen prop
  const [internalIsOpen, setInternalIsOpen] = useState(externalIsOpen);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (!disableEscapeClose && event.key === 'Escape' && internalIsOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [internalIsOpen, disableEscapeClose]);
  
  // Sync internal state with external prop
  useEffect(() => {
    // If we have a modalId, check sessionStorage first
    if (modalId) {
      const storedState = sessionStorage.getItem(`modal_${modalId}`);
      
      if (storedState === 'true') {
        // If sessionStorage says it should be open, open it
        setInternalIsOpen(true);
      } else {
        // Otherwise follow the external prop
        setInternalIsOpen(externalIsOpen);
      }
    } else {
      // No modalId, just follow external state
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen, modalId]);
  
  // Handle cleanup when component unmounts or modal closes
  useEffect(() => {
    // When internal state changes, update sessionStorage if we have an ID
    if (modalId) {
      if (internalIsOpen) {
        sessionStorage.setItem(`modal_${modalId}`, 'true');
      } else {
        sessionStorage.removeItem(`modal_${modalId}`);
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      if (modalId && !internalIsOpen) {
        sessionStorage.removeItem(`modal_${modalId}`);
      }
    };
  }, [internalIsOpen, modalId]);
  
  // The actual close handler that also updates sessionStorage
  const handleClose = () => {
    setInternalIsOpen(false);
    if (modalId) {
      sessionStorage.removeItem(`modal_${modalId}`);
    }
    onClose();
  };
  
  if (!internalIsOpen) return null;
  
  // Use portal to render modal at the document body level
  // This ensures the modal is not affected by parent component z-index or overflow settings
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className={`modal-content${fullWidth ? ' full-width' : ''}`}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={!fullWidth && width ? { width } : undefined}
      >
        <button className="close-btn" onClick={handleClose}>X</button>
        <div className="modal-scroll-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export { Modal, useModal };