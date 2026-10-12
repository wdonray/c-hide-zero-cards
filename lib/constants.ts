// =============================================================================
// CARD VISUAL DESIGN CONSTANTS
// =============================================================================

/**
 * Card container paint for each place value (kids redesign, issue #97).
 *
 * Paint only: the card geometry (dimensions, fan layout and positioning,
 * drag physics, hide-zero logic, interior digit/comma spacing) is
 * untouched. The paint matches the approved prototype tiles: a vertical
 * gradient, a larger corner radius, and a layered drop shadow plus a soft
 * text shadow on the digits.
 *
 * The gradient runs from the base hue to a 12% darkened stop, so the top
 * edge is the lightest point and white digits keep >= 4.5:1 contrast over
 * the whole card (WCAG 2.2 AA, owner decision 2026-10-05). Base hues are
 * the same darkened palette as before; only the paint treatment is new.
 */
export const CARD_PAINT: Record<number, { from: string; to: string }> = {
  // Ones, tens, hundreds (red shades)
  1: { from: '#DC2626', to: '#C22121' },
  10: { from: '#B91C1C', to: '#A31919' },
  100: { from: '#991B1B', to: '#871818' },

  // Thousands (yellow shades)
  1000: { from: '#A16207', to: '#8E5606' },
  10000: { from: '#854D0E', to: '#75440C' },
  100000: { from: '#713F12', to: '#633710' },

  // Millions (green shades)
  1000000: { from: '#15803D', to: '#127136' },
  10000000: { from: '#166534', to: '#13592E' },
  100000000: { from: '#14532D', to: '#124928' },

  // Billions (blue shades)
  1000000000: { from: '#2563EB', to: '#2157CF' },
}

/**
 * Shared paint treatment for every card, from the approved prototype:
 * 16px corners, a soft warm drop shadow with a darker inset bottom edge
 * (the "chunky" tile look), and a soft shadow under the white digits.
 */
export const CARD_PAINT_STYLE = {
  borderRadius: '20px',
  boxShadow:
    '0 8px 24px rgba(43, 33, 24, 0.25), inset 0 -6px 0 rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
  textShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
} as const

/**
 * Human-readable names for each place value
 * Used for accessibility and educational purposes
 */
export const PLACE_VALUE_NAMES: Record<number, string> = {
  1: 'ones',
  10: 'tens',
  100: 'hundreds',
  1000: 'thousands',
  10000: 'ten thousands',
  100000: 'hundred thousands',
  1000000: 'millions',
  10000000: 'ten millions',
  100000000: 'hundred millions',
  1000000000: 'billions',
}

// =============================================================================
// CARD POSITIONING AND ANIMATION CONSTANTS
// =============================================================================

/**
 * Default vertical spacing between cards when arranged in order
 */
export const CARD_Y_OFFSET = 0

/**
 * Distance (in pixels) a card moves per arrow-key press when keyboard dragging.
 * Keyboard support is a purely additive alternative to pointer dragging;
 * it does not change the visual design.
 */
export const CARD_KEYBOARD_MOVE_STEP = 10

// =============================================================================
// GAME LOGIC CONSTANTS
// =============================================================================

/**
 * Mapping of digit positions to their corresponding place values
 * Used to convert digit positions to actual place values (1, 10, 100, etc.)
 */
export const PLACE_VALUES: Record<number, number> = {
  0: 1,
  1: 10,
  2: 100,
  3: 1000,
  4: 10000,
  5: 100000,
  6: 1000000,
  7: 10000000,
  8: 100000000,
  9: 1000000000,
}

/**
 * Maximum number that can be generated randomly
 * Used to limit the range of random number generation
 */
export const DEFAULT_MAX_RANDOM_NUMBER = 1_000_000

export enum RANDOM_NUMBER_TYPE {
  BASIC = 'basic',
  ZERO_FOCUS = 'zero-focus',
}

/**
 * Absolute maximum number supported by the application
 * Used to validate user input and prevent overflow
 */
export const MAX_NUMBER = 1_000_000_000

// =============================================================================
// RESPONSIVE DESIGN CONSTANTS
// =============================================================================

/**
 * Breakpoint width for mobile devices
 * Used to determine when to show mobile-specific UI elements
 */
export const MOBILE_WIDTH = 768

/**
 * 44px minimum touch targets on coarse pointers (WCAG 2.5.8), applied as a
 * responsive/pointer-gated utility so the desktop mouse layout is untouched.
 */
export const COARSE_POINTER_TOUCH_TARGET = 'pointer-coarse:min-h-11 pointer-coarse:min-w-11'

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

/**
 * Keys used for storing user preferences and state in localStorage
 * All keys are prefixed with 'hzc-' (Hide Zero Cards) to avoid conflicts
 */
export const LOCAL_STORAGE_KEYS = {
  /** Whether the header is collapsed to save screen space */
  IS_HEADER_COLLAPSED: 'hzc-is-header-collapsed',
  /** Whether the user has seen the first-time toast notification */
  HAS_SEEN_FIRST_TIME_TOAST: 'hzc-has-seen-first-time-toast',
} as const

// =============================================================================
// TOAST NOTIFICATION CONSTANTS
// =============================================================================

/**
 * Duration (in milliseconds) for the first-time user toast notification
 * Set to 12 seconds to give children enough time to read the message
 */
export const FIRST_TIME_TOAST_DURATION = 12000

/**
 * Styling configuration for the first-time user toast notification
 * Uses CSS custom properties for theme-aware colors
 */
export const FIRST_TIME_TOAST_STYLE = {
  background: 'var(--toast-bg)',
  color: 'var(--toast-text)',
  border: '1px solid var(--toast-border)',
} as const

// =============================================================================
// NUMBER FORM DIALOG CONSTANTS
// =============================================================================

/**
 * Tabs for the number forms dialog
 */
export enum NumberFormsDialogTab {
  STANDARD = 'standard',
  WORD = 'word',
  UNIT = 'unit',
  EXPANDED = 'expanded',
}

/**
 * Tabs for the instructional guide dialog
 */
export enum InstructionalGuideDialogTab {
  QUICK_START = 'quick-start',
  TOOLBAR_FEATURES = 'toolbar-features',
  ACTIVITIES = 'activities',
  ASSESSMENT = 'assessment',
}
