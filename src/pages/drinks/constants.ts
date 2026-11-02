// Supported drink sizes on the frontend
export const DRINK_SIZES = ['S', 'M', 'L'] as const;

// Drink size type generated from supported size values
export type DrinkSize = (typeof DRINK_SIZES)[number];

// Default size used when creating a new drink
export const DEFAULT_DRINK_SIZE: DrinkSize = 'M';

// Status sent in requests: 1 = on sale, 0 = not on sale
export const DRINK_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const;

// Status label returned by the API for a drink on sale ("Ngừng bán" / "Không xác định" otherwise)
const DRINK_ACTIVE_LABEL = 'Đang bán';

export function isDrinkActive(status: unknown): boolean {
  return status === DRINK_STATUS.ACTIVE || status === DRINK_ACTIVE_LABEL;
}
