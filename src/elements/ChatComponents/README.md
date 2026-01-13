# Chat Components

A component system for displaying cards, credits, perks, and multipliers inline within chat messages. Each component supports optional actions with undo functionality.

## Overview

These components appear below chat messages to show entities that were referenced or modified during the conversation. They provide:

- Visual representation of cards, credits, perks, and multipliers
- Action indicators showing what changed (e.g., "Set from $0 to $50")
- Undo functionality for reversing actions before the next message is sent
- Click-to-open behavior for cards and credits

## Components

### ChatComponentBlock

Container component that renders a list of mixed component types.

```tsx
import { ChatComponentBlock } from '@/elements/ChatComponents';

<ChatComponentBlock
  block={block}
  onCardClick={(cardId) => openCardModal(cardId)}
  onCreditClick={(cardId, creditId) => openCreditModal(cardId, creditId)}
  onUndoAction={(action) => handleUndo(action)}
  canUndo={true}
  undoPendingActionId={null}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `block` | `ChatComponentBlock` | Block containing items to render |
| `onCardClick` | `(cardId: string) => void` | Handler when a card is clicked |
| `onCreditClick` | `(cardId: string, creditId: string) => void` | Handler when a credit is clicked |
| `onUndoAction` | `(action: ChatComponentAction) => void` | Handler when undo is clicked |
| `canUndo` | `boolean` | Whether undo buttons are available |
| `undoPendingActionId` | `string \| null` | ID of action currently being undone |

### ChatCardComponent

Displays a credit card with optional action. Based on the sidebar's `CreditCardPreview` component.

**Features:**
- Card icon (32px) with primary/secondary colors
- Frozen badge (snowflake icon) - displayed first
- Preferred badge (star icon) - displayed second
- Card name and network
- Click opens card detail modal

**Actions:** add, remove, set_preferred, frozen, unfrozen, activation, set_open_date

### ChatCreditComponent

Displays a credit with usage information. Based on the `CreditEntry` component from My Credits page.

**Features:**
- Card icon (12px height) next to credit title
- Period type below (Monthly, Quarterly, etc.)
- Usage display ($X / $Y) with status icon
- Color-coded status: Not Used (green), Partially Used (yellow), Used (gray)
- Click opens credit edit modal

**Actions:** update_usage (shows "Set from $X to $Y")

### ChatPerkComponent

Displays a card perk. Display-only (no click action).

**Features:**
- Card icon (12px height) next to perk title
- Description (2-line truncation)

**Actions:** track, untrack

### ChatMultiplierComponent

Displays a reward multiplier. Display-only (no click action).

**Features:**
- Multiplier badge (e.g., "2x", "3x", or "Bonus")
- Card icon (12px height) next to title
- Description or category display

**Actions:** track, untrack

### ActionDisplay

Shared component for displaying action text with undo button.

**States:**
1. **Normal:** Check icon + action text + "Undo" button
2. **Pending:** Check icon + action text + "Undoing..." button (disabled, with spinner)
3. **Undone:** Undo arrow icon + strikethrough text + "Undone" button (disabled)
4. **Expired:** Check icon + action text only (no button - next message was sent)

### ShowMoreButton

Expandable button for lists with more than 5 items.

## Types

All types are defined in `src/types/ChatComponentTypes.ts`.

### Component Types

```typescript
const CHAT_COMPONENT_TYPES = {
  CARD: 'card',
  CREDIT: 'credit',
  PERK: 'perk',
  MULTIPLIER: 'multiplier',
} as const;
```

### Action Types

```typescript
// Card actions
const CARD_ACTION_TYPES = {
  ADD: 'add',
  REMOVE: 'remove',
  SET_PREFERRED: 'set_preferred',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
  ACTIVATION: 'activation',
  SET_OPEN_DATE: 'set_open_date',
} as const;

// Credit actions
const CREDIT_ACTION_TYPES = {
  UPDATE_USAGE: 'update_usage',
} as const;

// Perk/Multiplier actions
const PERK_ACTION_TYPES = {
  TRACK: 'track',
  UNTRACK: 'untrack',
} as const;
```

### Key Interfaces

```typescript
interface ChatComponentBlock {
  id: string;
  messageId: string;
  timestamp: string;
  items: ChatComponentItem[];
}

interface CardComponentItem {
  id: string;
  componentType: 'card';
  displayOrder: number;
  card: CreditCardDetails;
  action?: CardAction;
}

interface CreditComponentItem {
  id: string;
  componentType: 'credit';
  displayOrder: number;
  cardCredit: CardCredit;
  card: CreditCardDetails;
  userCredit: UserCredit;
  creditMaxValue: number;
  currentValueUsed: number;
  action?: CreditAction;
}
```

## Styling

### Dimensions
- **Component width:** 400px (fixed), 100% on mobile
- **Card icon (ChatCardComponent):** 32px with top margin
- **Card icon (Credit/Perk/Multiplier):** 12px height, auto width (matches my-credits page)

### Font Sizes
- **Titles/Names:** `$font-sm` (14px)
- **Secondary text:** `$font-xs` (12px)
- **Action text:** `$font-xs` (12px)

### Shared Styles

Base styles are in `shared.scss`:
- `.chat-component-item` - Base container styling
- `.clickable` - Hover states for interactive components
- Border, padding, and transition styles

## Behaviors

### Click Handling
- **Cards:** Opens `CreditCardDetailView` modal
- **Credits:** Opens credit edit modal (Drawer on mobile, Dialog on desktop)
- **Perks/Multipliers:** No click action (display only)

### Undo Flow
1. User clicks "Undo" button
2. `onUndoAction` callback fires with the action
3. Parent sets `undoPendingActionId` to show loading state
4. API call completes, action's `isUndone` is set to `true`
5. Button shows "Undone" (disabled), text has strikethrough, icon changes to undo arrow

### Undo Availability
- Undo is available until the next message is sent
- After next message, `canUndo` becomes `false` and buttons are hidden
- Undone actions always show the "Undone" button (disabled) regardless of `canUndo`

## File Structure

```
src/elements/ChatComponents/
  index.tsx                     # Barrel export
  README.md                     # This file
  shared.scss                   # Shared styles and mixins

  ChatComponentBlock/
    index.tsx
    ChatComponentBlock.scss

  ChatCardComponent/
    index.tsx
    ChatCardComponent.scss

  ChatCreditComponent/
    index.tsx
    ChatCreditComponent.scss

  ChatPerkComponent/
    index.tsx
    ChatPerkComponent.scss

  ChatMultiplierComponent/
    index.tsx
    ChatMultiplierComponent.scss

  ActionDisplay/
    index.tsx
    ActionDisplay.scss

  ShowMoreButton/
    index.tsx
    ShowMoreButton.scss
```

## Design System

Components are showcased in the design system at `/design-system` under the "Chat Components" section.

See `src/pages/design-system/sections/ChatComponentsSection.tsx` for examples of all component states and variations.
