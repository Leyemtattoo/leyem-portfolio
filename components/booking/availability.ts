export const parisBookingDates = ["2026-11-18", "2026-11-19"] as const;

export const isParisBookingDate = (date: string) => parisBookingDates.some((allowed) => allowed === date);
