export const CARD_COLORS: Record<number, string> = {
  1: 'bg-red-400',
  10: 'bg-red-500',
  100: 'bg-red-600',

  1000: 'bg-yellow-300',
  10000: 'bg-yellow-400',
  100000: 'bg-yellow-500',

  1000000: 'bg-green-400',
  10000000: 'bg-green-500',
  100000000: 'bg-green-600',

  1000000000: 'bg-blue-500',
}

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

export const CARD_X_OFFSET = 38
export const CARD_Y_OFFSET = 0
export const CARD_RANDOM_X_OFFSET = 400
export const CARD_RANDOM_Y_OFFSET = 175

export const DEFAULT_MAX_RANDOM_NUMBER = 1_000_000
export const MAX_NUMBER = 1_000_000_000

export const MOBILE_WIDTH = 768
