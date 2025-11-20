import React from 'react';

interface LoadingProgressProps {
    loading: boolean;
    progress?: number;
    message?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ loading, progress, message }) => {
    if (!loading) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
        }}>
            <div>{message || "Loading..."}</div>
            {progress !== undefined && (
                <div style={{ marginTop: 10, width: 200, height: 5, background: '#333' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#4CAF50' }} />
                </div>
            )}
        </div>
    );
};

