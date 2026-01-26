import React, { useState, useEffect } from 'react';
import { TimelineState } from '../../../types/AgentChatTypes';
import TimelineNode from './TimelineNode';
import CollapsedTimeline from './CollapsedTimeline';
import './styles.scss';

interface AgentTimelineProps {
  timeline: TimelineState;
  isStreaming: boolean;
}

/**
 * AgentTimeline Component
 *
 * Displays agent execution progress during AI processing.
 * Shows agents stacked vertically with nested tool calls.
 * Auto-collapses after completion, expandable on click.
 */
const AgentTimeline: React.FC<AgentTimelineProps> = ({ timeline, isStreaming }) => {
  const { nodes, isComplete, isCollapsed: timelineCollapsed } = timeline;
  const [isExpanded, setIsExpanded] = useState(!timelineCollapsed);

  // Auto-expand when streaming starts
  useEffect(() => {
    if (isStreaming && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isStreaming, isExpanded]);

  // Auto-collapse when timeline completes
  useEffect(() => {
    if (isComplete && timelineCollapsed && isExpanded) {
      // Small delay before collapsing for better UX
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, timelineCollapsed, isExpanded]);

  // Filter out chat_node - it shows "Thinking..." which is redundant with router_node
  const visibleNodes = nodes.filter(n => n.node !== 'chat_node');

  // Don't render if no visible nodes
  if (visibleNodes.length === 0) {
    return null;
  }

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (isComplete) {
      setIsExpanded(false);
    }
  };

  return (
    <div className={`agent-timeline ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded ? (
        <div className="timeline-expanded" onClick={handleCollapse}>
          {visibleNodes.map((node) => (
            <TimelineNode key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <CollapsedTimeline nodes={visibleNodes} onClick={handleExpand} />
      )}
    </div>
  );
};

export { AgentTimeline };
export default AgentTimeline;
