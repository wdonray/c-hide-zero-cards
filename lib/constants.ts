// =============================================================================
// CARD VISUAL DESIGN CONSTANTS
// =============================================================================

/**
 * Color mapping for different place value cards
 * Each place value gets a specific background color for visual distinction
 */
export const CARD_COLORS: Record<number, string> = {
  // Ones, tens, hundreds (red shades)
  1: 'bg-red-400',
  10: 'bg-red-500',
  100: 'bg-red-600',

  // Thousands (yellow shades)
  1000: 'bg-yellow-300',
  10000: 'bg-yellow-400',
  100000: 'bg-yellow-500',

  // Millions (green shades)
  1000000: 'bg-green-400',
  10000000: 'bg-green-500',
  100000000: 'bg-green-600',

  // Billions (blue shades)
  1000000000: 'bg-blue-500',
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
 * Default horizontal spacing between cards when arranged in order
 */
export const CARD_X_OFFSET = 36

/**
 * Default vertical spacing between cards when arranged in order
 */
export const CARD_Y_OFFSET = 0

/**
 * Maximum horizontal offset for random card positioning
 */
export const CARD_RANDOM_X_OFFSET = 400

/**
 * Maximum vertical offset for random card positioning
 */
export const CARD_RANDOM_Y_OFFSET = 175

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
