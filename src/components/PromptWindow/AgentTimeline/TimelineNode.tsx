import React from 'react';
import { Icon } from '../../../icons';
import { TimelineNode as TimelineNodeType } from '../../../types/AgentChatTypes';
import { getNodeIcon, getNodeFinishedMessage } from './utils';
import TimelineToolCall from './TimelineToolCall';

interface TimelineNodeProps {
  node: TimelineNodeType;
}

/**
 * Individual agent node in the timeline
 * Shows icon, message, nested tool calls, and pulsing animation when active
 */
const TimelineNode: React.FC<TimelineNodeProps> = ({ node }) => {
  const { node: nodeName, message, status, toolCalls } = node;
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const displayMessage = isCompleted ? getNodeFinishedMessage(nodeName) : message;

  return (
    <div className={`timeline-node ${status}`}>
      <div className={`node-header ${isActive ? 'pulsing' : ''}`}>
        <span className="node-indicator">
          <Icon
            name={getNodeIcon(nodeName)}
            variant="mini"
            size={16}
            className="node-icon"
          />
        </span>
        <span className="node-message">{displayMessage}</span>
      </div>
      {toolCalls.length > 0 && (
        <div className="node-tools">
          {toolCalls.map((toolCall) => (
            <TimelineToolCall key={toolCall.id} toolCall={toolCall} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineNode;
