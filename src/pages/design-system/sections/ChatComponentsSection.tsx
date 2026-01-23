import React, { useState } from 'react';
import {
  ChatComponentBlock,
  ChatCardComponent,
  ChatCreditComponent,
  ChatPerkComponent,
  ChatMultiplierComponent,
  ActionDisplay,
  ShowMoreButton,
} from '../../../elements/ChatComponents';
import { StreamingIndicator } from '../../../components/PromptWindow/StreamingIndicator';
import { AgentTimeline } from '../../../components/PromptWindow/AgentTimeline';
import { TimelineState } from '../../../types/AgentChatTypes';
import {
  mockCardComponentItems,
  mockCreditComponentItems,
  mockPerkComponentItems,
  mockMultiplierComponentItems,
  mockChatComponentBlock,
  mockLargeChatComponentBlock,
} from '../components/mock-data';
import {
  ChatComponentAction,
  CardAction,
  CreditAction,
  PerkAction,
  MultiplierAction,
  CARD_ACTION_TYPES,
  CREDIT_ACTION_TYPES,
  PERK_ACTION_TYPES,
  CHAT_COMPONENT_TYPES,
} from '../../../types/ChatComponentTypes';

/**
 * Design system section showcasing chat components
 */
const ChatComponentsSection: React.FC = () => {
  const [pendingUndoActions, setPendingUndoActions] = useState<Set<string>>(new Set());
  const [showMoreExpanded, setShowMoreExpanded] = useState(false);

  const handleCardClick = (cardId: string) => {
    console.log('Card clicked:', cardId);
  };

  const handleCreditClick = (cardId: string, creditId: string) => {
    console.log('Credit clicked:', cardId, creditId);
  };

  const handlePerkClick = (cardId: string, perkId: string) => {
    console.log('Perk clicked, open card modal to perks tab:', cardId, perkId);
  };

  const handleMultiplierClick = (cardId: string, multiplierId: string) => {
    console.log('Multiplier clicked, open card modal to multipliers tab:', cardId, multiplierId);
  };

  const handleUndoAction = (action: ChatComponentAction) => {
    console.log('Undo action:', action);
    // Simulate pending state
    setPendingUndoActions((prev) => new Set(prev).add(action.id));
    setTimeout(() => {
      setPendingUndoActions((prev) => {
        const next = new Set(prev);
        next.delete(action.id);
        return next;
      });
    }, 1500);
  };

  // Create mock actions for ActionDisplay demos
  const mockCardAction: CardAction = {
    id: 'demo-card-action',
    componentType: CHAT_COMPONENT_TYPES.CARD,
    timestamp: new Date().toISOString(),
    isUndone: false,
    actionType: CARD_ACTION_TYPES.ADD,
    cardId: 'demo',
  };

  const mockCreditAction: CreditAction = {
    id: 'demo-credit-action',
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    timestamp: new Date().toISOString(),
    isUndone: false,
    actionType: CREDIT_ACTION_TYPES.UPDATE_USAGE,
    cardId: 'demo',
    creditId: 'demo',
    periodNumber: 1,
    year: new Date().getFullYear(),
    fromValue: 0,
    toValue: 10,
  };

  const mockUndoneAction: PerkAction = {
    id: 'demo-undone-action',
    componentType: CHAT_COMPONENT_TYPES.PERK,
    timestamp: new Date().toISOString(),
    isUndone: true,
    actionType: PERK_ACTION_TYPES.TRACK,
    cardId: 'demo',
    perkId: 'demo',
  };

  // Streaming indicator states to showcase (using ActiveNode format)
  const streamingIndicatorStates = [
    { node: { name: 'router_node', message: 'Thinking...', startTime: Date.now() }, tool: null, label: 'Default / Chat' },
    { node: { name: 'spend_node', message: 'Finding the best card...', startTime: Date.now() }, tool: null, label: 'Spend Agent' },
    { node: { name: 'credit_node', message: 'Checking your credits...', startTime: Date.now() }, tool: null, label: 'Credit Agent' },
    { node: { name: 'card_node', message: 'Looking up card info...', startTime: Date.now() }, tool: null, label: 'Card Agent' },
    { node: { name: 'stats_node', message: 'Calculating your stats...', startTime: Date.now() }, tool: null, label: 'Stats Agent' },
    { node: { name: 'action_node', message: 'Updating your data...', startTime: Date.now() }, tool: null, label: 'Action Agent' },
    { node: { name: 'composer_node', message: 'Preparing response...', startTime: Date.now() }, tool: null, label: 'Composer' },
  ];

  // Tool indicator states to showcase (tool nested under node)
  const toolIndicatorStates = [
    {
      node: { name: 'spend_node', message: 'Finding the best card...', startTime: Date.now() },
      tool: { name: 'get_user_cards', message: 'Loading your cards...', startTime: Date.now() },
      label: 'Node + Tool'
    },
    {
      node: { name: 'credit_node', message: 'Checking your credits...', startTime: Date.now() },
      tool: { name: 'get_expiring_credits', message: 'Checking expiring credits...', startTime: Date.now() },
      label: 'Credit + Expiring Tool'
    },
    {
      node: { name: 'stats_node', message: 'Calculating your stats...', startTime: Date.now() },
      tool: { name: 'get_monthly_stats', message: 'Calculating monthly stats...', startTime: Date.now() },
      label: 'Stats + Monthly Tool'
    },
  ];

  // Mock timeline states for AgentTimeline demos
  const mockActiveTimeline: TimelineState = {
    nodes: [
      {
        id: 'node-1',
        node: 'router_node',
        message: 'Thinking...',
        status: 'completed',
        startTime: Date.now() - 2000,
        endTime: Date.now() - 1500,
        toolCalls: [],
      },
      {
        id: 'node-2',
        node: 'spend_node',
        message: 'Finding the best card...',
        status: 'active',
        startTime: Date.now() - 1500,
        toolCalls: [
          {
            id: 'tool-1',
            tool: 'get_user_cards',
            parentNode: 'spend_node',
            activeMessage: 'Loading your cards...',
            resultMessage: 'Your cards loaded',
            status: 'completed',
            startTime: Date.now() - 1400,
            endTime: Date.now() - 1200,
          },
          {
            id: 'tool-2',
            tool: 'get_expiring_credits',
            parentNode: 'spend_node',
            activeMessage: 'Finding expiring credits...',
            status: 'active',
            startTime: Date.now() - 500,
          },
        ],
      },
    ],
    isComplete: false,
    isCollapsed: false,
  };

  const mockCompletedTimeline: TimelineState = {
    nodes: [
      {
        id: 'node-1',
        node: 'router_node',
        message: 'Thinking...',
        status: 'completed',
        startTime: Date.now() - 3000,
        endTime: Date.now() - 2500,
        toolCalls: [],
      },
      {
        id: 'node-2',
        node: 'spend_node',
        message: 'Finding the best card...',
        status: 'completed',
        startTime: Date.now() - 2500,
        endTime: Date.now() - 1500,
        toolCalls: [
          {
            id: 'tool-1',
            tool: 'get_user_cards',
            parentNode: 'spend_node',
            activeMessage: 'Loading your cards...',
            resultMessage: 'Your cards loaded',
            status: 'completed',
            startTime: Date.now() - 2400,
            endTime: Date.now() - 2200,
          },
          {
            id: 'tool-2',
            tool: 'get_expiring_credits',
            parentNode: 'spend_node',
            activeMessage: 'Finding expiring credits...',
            resultMessage: 'Found expiring',
            status: 'completed',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1800,
          },
        ],
      },
      {
        id: 'node-3',
        node: 'composer_node',
        message: 'Preparing response...',
        status: 'completed',
        startTime: Date.now() - 1500,
        endTime: Date.now() - 500,
        toolCalls: [],
      },
    ],
    isComplete: true,
    isCollapsed: false,
  };

  const mockCollapsedTimeline: TimelineState = {
    ...mockCompletedTimeline,
    isCollapsed: true,
  };

  return (
    <div className="ds-subsection">
      <h2>Chat Components</h2>
      <p className="ds-description">
        Components displayed inline after chat messages with optional action/undo functionality.
      </p>

      {/* Streaming Indicator States - Node Only */}
      <div className="ds-subsection">
        <h3>StreamingIndicator - Node States</h3>
        <p className="ds-description">
          Loading indicators shown during agent node execution with contextual icons.
        </p>
        <div className="ds-showcase-grid">
          {streamingIndicatorStates.map((state, index) => (
            <div key={index} className="ds-showcase-item">
              <span className="ds-showcase-label">{state.label}</span>
              <StreamingIndicator
                activeNode={state.node}
                activeTool={state.tool}
                isVisible={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Streaming Indicator States - Node + Tool */}
      <div className="ds-subsection">
        <h3>StreamingIndicator - Node + Tool States</h3>
        <p className="ds-description">
          Tool indicators shown nested under node when executing a tool within an agent.
        </p>
        <div className="ds-showcase-grid">
          {toolIndicatorStates.map((state, index) => (
            <div key={index} className="ds-showcase-item">
              <span className="ds-showcase-label">{state.label}</span>
              <StreamingIndicator
                activeNode={state.node}
                activeTool={state.tool}
                isVisible={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Agent Timeline States */}
      <div className="ds-subsection">
        <h3>AgentTimeline - Active</h3>
        <p className="ds-description">
          Timeline during streaming: router completed, spend_node active with nested tools.
          Active items pulse, completed items are gray.
        </p>
        <div className="ds-component-list">
          <AgentTimeline
            timeline={mockActiveTimeline}
            isStreaming={true}
          />
        </div>
      </div>

      <div className="ds-subsection">
        <h3>AgentTimeline - Completed (Expanded)</h3>
        <p className="ds-description">
          Timeline after streaming completes. All nodes and tools show as completed (gray).
          Click to collapse.
        </p>
        <div className="ds-component-list">
          <AgentTimeline
            timeline={mockCompletedTimeline}
            isStreaming={false}
          />
        </div>
      </div>

      <div className="ds-subsection">
        <h3>AgentTimeline - Collapsed</h3>
        <p className="ds-description">
          Auto-collapsed state after response completes. Shows mini icons row.
          Click to expand and view agent steps.
        </p>
        <div className="ds-component-list">
          <AgentTimeline
            timeline={mockCollapsedTimeline}
            isStreaming={false}
          />
        </div>
      </div>

      {/* ActionDisplay States */}
      <div className="ds-subsection">
        <h3>ActionDisplay States</h3>
        <div className="ds-showcase-grid">
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Normal (can undo)</span>
            <ActionDisplay
              action={mockCardAction}
              onUndo={() => console.log('Undo clicked')}
              canUndo={true}
            />
          </div>
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Credit Action</span>
            <ActionDisplay
              action={mockCreditAction}
              onUndo={() => console.log('Undo clicked')}
              canUndo={true}
            />
          </div>
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Pending Undo</span>
            <ActionDisplay
              action={mockCardAction}
              onUndo={() => {}}
              canUndo={true}
              isUndoPending={true}
            />
          </div>
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Undone State</span>
            <ActionDisplay
              action={mockUndoneAction}
              onUndo={() => {}}
              canUndo={true}
            />
          </div>
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Expired (no button)</span>
            <ActionDisplay
              action={mockCardAction}
              onUndo={() => {}}
              canUndo={false}
            />
          </div>
        </div>
      </div>

      {/* ShowMoreButton */}
      <div className="ds-subsection">
        <h3>ShowMoreButton</h3>
        <div className="ds-showcase-grid">
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Collapsed</span>
            <ShowMoreButton
              hiddenCount={5}
              isExpanded={false}
              onToggle={() => setShowMoreExpanded(true)}
            />
          </div>
          <div className="ds-showcase-item">
            <span className="ds-showcase-label">Expanded</span>
            <ShowMoreButton
              hiddenCount={5}
              isExpanded={true}
              onToggle={() => setShowMoreExpanded(false)}
            />
          </div>
        </div>
      </div>

      {/* Card Components */}
      <div className="ds-subsection">
        <h3>ChatCardComponent</h3>
        <p className="ds-description">
          Cards with various actions: Add, Set Preferred, Frozen, Undone, No Action
        </p>
        <div className="ds-component-list">
          {mockCardComponentItems.map((item) => (
            <ChatCardComponent
              key={item.id}
              item={item}
              onCardClick={handleCardClick}
              onUndoAction={handleUndoAction}
              canUndo={true}
              isUndoPending={pendingUndoActions.has(item.action?.id || '')}
            />
          ))}
        </div>
      </div>

      {/* Credit Components */}
      <div className="ds-subsection">
        <h3>ChatCreditComponent</h3>
        <p className="ds-description">
          Credits with usage display and update actions
        </p>
        <div className="ds-component-list">
          {mockCreditComponentItems.map((item) => (
            <ChatCreditComponent
              key={item.id}
              item={item}
              onCreditClick={handleCreditClick}
              onUndoAction={handleUndoAction}
              canUndo={true}
              isUndoPending={pendingUndoActions.has(item.action?.id || '')}
            />
          ))}
        </div>
      </div>

      {/* Perk Components */}
      <div className="ds-subsection">
        <h3>ChatPerkComponent</h3>
        <p className="ds-description">
          Perks with track/untrack actions (clickable - opens card modal to perks tab)
        </p>
        <div className="ds-component-list">
          {mockPerkComponentItems.map((item) => (
            <ChatPerkComponent
              key={item.id}
              item={item}
              onPerkClick={handlePerkClick}
              onUndoAction={handleUndoAction}
              canUndo={true}
              isUndoPending={pendingUndoActions.has(item.action?.id || '')}
            />
          ))}
        </div>
      </div>

      {/* Multiplier Components */}
      <div className="ds-subsection">
        <h3>ChatMultiplierComponent</h3>
        <p className="ds-description">
          Multipliers with badge and category (clickable - opens card modal to multipliers tab)
        </p>
        <div className="ds-component-list">
          {mockMultiplierComponentItems.map((item) => (
            <ChatMultiplierComponent
              key={item.id}
              item={item}
              onMultiplierClick={handleMultiplierClick}
              onUndoAction={handleUndoAction}
              canUndo={true}
              isUndoPending={pendingUndoActions.has(item.action?.id || '')}
            />
          ))}
        </div>
      </div>

      {/* Mixed Component Block */}
      <div className="ds-subsection">
        <h3>ChatComponentBlock (Mixed)</h3>
        <p className="ds-description">
          Container rendering mixed component types in a single block
        </p>
        <div className="ds-component-list">
          <ChatComponentBlock
            block={mockChatComponentBlock}
            canUndo={true}
            onCardClick={handleCardClick}
            onCreditClick={handleCreditClick}
            onPerkClick={handlePerkClick}
            onMultiplierClick={handleMultiplierClick}
            onUndoAction={handleUndoAction}
            pendingUndoActions={pendingUndoActions}
          />
        </div>
      </div>

      {/* Large Block with Show More */}
      <div className="ds-subsection">
        <h3>ChatComponentBlock (Large - Show More)</h3>
        <p className="ds-description">
          Block with more than 5 items showing expansion button
        </p>
        <div className="ds-component-list">
          <ChatComponentBlock
            block={mockLargeChatComponentBlock}
            canUndo={true}
            onCardClick={handleCardClick}
            onCreditClick={handleCreditClick}
            onPerkClick={handlePerkClick}
            onMultiplierClick={handleMultiplierClick}
            onUndoAction={handleUndoAction}
            pendingUndoActions={pendingUndoActions}
          />
        </div>
      </div>

      {/* Undo Disabled State */}
      <div className="ds-subsection">
        <h3>Undo Disabled (Next Message Sent)</h3>
        <p className="ds-description">
          After user sends next message, undo buttons are hidden
        </p>
        <div className="ds-component-list">
          <ChatCardComponent
            item={mockCardComponentItems[0]}
            onCardClick={handleCardClick}
            canUndo={false}
          />
          <ChatCreditComponent
            item={mockCreditComponentItems[0]}
            onCreditClick={handleCreditClick}
            canUndo={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatComponentsSection;
