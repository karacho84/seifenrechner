export function calculateTotalPercentage(oils: { percentage: number }[]): number {
  return oils.reduce((sum, oil) => sum + oil.percentage, 0);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
