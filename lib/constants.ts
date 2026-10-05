// =============================================================================
// CARD VISUAL DESIGN CONSTANTS
// =============================================================================

/**
 * Color mapping for different place value cards
 * Each place value gets a specific background color for visual distinction
 */
export const CARD_COLORS: Record<number, string> = {
  // Ones, tens, hundreds (red shades) — darkened so white digits pass
  // WCAG 2.2 AA 4.5:1 (red-600 is 4.76:1); hue family unchanged.
  1: 'bg-red-600',
  10: 'bg-red-700',
  100: 'bg-red-800',

  // Thousands (yellow shades) — darkened (yellow-700 is 4.92:1)
  1000: 'bg-yellow-700',
  10000: 'bg-yellow-800',
  100000: 'bg-yellow-900',

  // Millions (green shades) — darkened (green-700 is 4.94:1)
  1000000: 'bg-green-700',
  10000000: 'bg-green-800',
  100000000: 'bg-green-900',

  // Billions (blue shades) — darkened (blue-600 is 5.26:1)
  1000000000: 'bg-blue-600',
}

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
 * Display text for zero digits in different place values
 * Shows how zeros should be formatted (e.g., "0,000" for thousands)
 */
export const FAKE_ZERO_NUMBERS: Record<number, string> = {
  0: '0',
  1: '00',
  2: '000',
  3: '0,000',
  4: '00,000',
  5: '000,000',
  6: '0,000,000',
  7: '00,000,000',
  8: '000,000,000',
  9: '0,000,000,000',
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
  /** Whether the user has seen the welcome dialog */
  HAS_SEEN_WELCOME_DIALOG: 'hzc-has-seen-welcome-dialog',
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
