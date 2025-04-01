import React, { useState } from 'react';
import PreferencesModule from '../components/PreferencesModule';
import Modal from '../components/Modal';
import { auth } from '../config/firebase';
import axios from 'axios';

const apiurl = process.env.REACT_APP_BASE_URL;

const Preferences = ({ 
    onModalOpen, 
    preferencesInstructions, 
    setPreferencesInstructions,
    chatHistoryPreference,
    setChatHistoryPreference,
    setChatHistory,
    setHistoryRefreshTrigger
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState({ type: 'confirm', message: '' });

    const handleDeleteAllChats = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await axios.delete(`${apiurl}/api/history/delete_all_chats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setChatHistory([]);
                setHistoryRefreshTrigger(prev => prev + 1);
                
                setDeleteStatus({ 
                    type: 'success', 
                    message: 'All chat history has been deleted successfully.' 
                });
            } else {
                throw new Error('Failed to delete chat history');
            }
        } catch (error) {
            console.error('Error deleting chat history:', error);
            setDeleteStatus({ 
                type: 'error', 
                message: 'Failed to delete chat history. Please try again.' 
            });
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setDeleteStatus({ type: 'confirm', message: '' });
    };

    const renderModalContent = () => {
        switch (deleteStatus.type) {
            case 'success':
                return (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h2 style={{ color: '#4CAF50' }}>Success!</h2>
                        <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
                        <button
                            onClick={handleCloseModal}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: '#4CAF50',
                                color: 'white'
                            }}
                        >
                            Close
                        </button>
                    </div>
                );
            case 'error':
                return (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h2 style={{ color: '#f44336' }}>Error</h2>
                        <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: '#fff'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteStatus({ type: 'confirm', message: '' });
                                    handleDeleteAllChats();
                                }}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: '#f44336',
                                    color: 'white'
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                );
            default: // 'confirm' case
                return (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h2>Delete All Chat History</h2>
                        <p style={{ margin: '20px 0' }}>
                            Are you sure you want to delete all chat history? 
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: '#fff'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAllChats}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: '#ff0000',
                                    color: 'white'
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="preferences-page">
            <div className="preferences-page-container">
                <h1>Preferences</h1>
                <button onClick={onModalOpen} className="credit-card-button">
                    Manage Credit Cards
                </button>
                <PreferencesModule 
                    initialInstructions={preferencesInstructions}
                    onInstructionsUpdate={setPreferencesInstructions}
                    chatHistoryPreference={chatHistoryPreference}
                    setChatHistoryPreference={setChatHistoryPreference}
                />
                
                <div className="danger-zone" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ff0000', borderRadius: '4px' }}>
                    <h2 style={{ color: '#ff0000' }}>Danger Zone</h2>
                    <p>Once you delete your chat history, there is no going back. Please be certain.</p>
                    <button 
                        onClick={() => setShowDeleteModal(true)}
                        style={{
                            backgroundColor: '#ff0000',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Delete All Chat History
                    </button>
                </div>
            </div>

            <Modal 
                show={showDeleteModal} 
                handleClose={handleCloseModal}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Preferences;