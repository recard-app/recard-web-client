import React from 'react';
import { Icon } from '../../../icons';
import { TimelineToolCall as TimelineToolCallType } from '../../../types/AgentChatTypes';
import { getToolIcon } from './utils';

interface TimelineToolCallProps {
  toolCall: TimelineToolCallType;
}

/**
 * Individual tool call item in the timeline
 * Shows icon, message (active or result), and pulsing animation when active
 */
const TimelineToolCall: React.FC<TimelineToolCallProps> = ({ toolCall }) => {
  const { tool, status, activeMessage, resultMessage } = toolCall;
  const isActive = status === 'active';
  const message = isActive ? activeMessage : (resultMessage || activeMessage);

  return (
    <div className={`timeline-tool ${status} ${isActive ? 'pulsing' : ''}`}>
      <span className="tool-indicator">
        <Icon
          name={getToolIcon(tool)}
          variant="micro"
          size={12}
          className="tool-icon"
        />
      </span>
      <span className="tool-message">{message}</span>
    </div>
  );
};

export default TimelineToolCall;
