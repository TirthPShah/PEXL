export function calculatePlatformCharges(subtotal: number): number {
  return subtotal < 50 ? 50 - subtotal : 5;
}
