import React from 'react';

interface InfoTooltipProps {
    text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    return (
        <div className="info-tooltip">
            {text}
        </div>
    );
};

