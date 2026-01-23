import React from 'react';
import { Icon } from '../../../icons';
import { TimelineNode } from '../../../types/AgentChatTypes';
import { getUniqueNodeIcons } from './utils';

interface CollapsedTimelineProps {
  nodes: TimelineNode[];
  onClick: () => void;
}

const MAX_ICONS = 5;

/**
 * Collapsed timeline view showing mini icons row
 * Clickable to expand the full timeline
 */
const CollapsedTimeline: React.FC<CollapsedTimelineProps> = ({ nodes, onClick }) => {
  const uniqueIcons = getUniqueNodeIcons(nodes, MAX_ICONS);
  const hasMore = nodes.length > uniqueIcons.length;
  const extraCount = nodes.length - uniqueIcons.length;

  return (
    <button className="collapsed-timeline" onClick={onClick} type="button">
      <div className="collapsed-icons">
        {uniqueIcons.map((iconName, index) => (
          <span key={index} className="collapsed-icon">
            <Icon
              name={iconName}
              variant="micro"
              size={14}
              className="icon"
            />
          </span>
        ))}
        {hasMore && (
          <span className="collapsed-more">+{extraCount}</span>
        )}
      </div>
      <span className="collapsed-hint">
        View agent steps
        <Icon name="chevron-right" variant="micro" size={12} className="hint-icon" />
      </span>
    </button>
  );
};

export default CollapsedTimeline;
