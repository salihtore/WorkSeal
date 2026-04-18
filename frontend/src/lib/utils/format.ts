// Sui MIST value conversions (1 SUI = 1_000_000_000 MIST)
const MIST_PER_SUI = 1_000_000_000n;

/**
 * Parses a string SUI value (like "1.5") into MIST (BigInt) for on-chain TX
 */
export function parseSuiToMist(suiAmount: string): bigint {
  try {
    const value = parseFloat(suiAmount);
    if (isNaN(value) || value < 0) return 0n;
    
    // Yüzer nokta hatalarını önlemek için çarpıp truncate ediyoruz
    return BigInt(Math.floor(value * Number(MIST_PER_SUI)));
  } catch (error) {
    console.error("Invalid SUI amount", error);
    return 0n;
  }
}

/**
 * Formats a BigInt MIST value (from chain) back to SUI string for UI representation
 */
export function formatMistToSui(mistAmount: bigint | string | number): string {
  try {
    const mist = BigInt(mistAmount);
    const sui = Number(mist) / Number(MIST_PER_SUI);
    // Display up to 2 decimal places if needed (or more depending on utility)
    return sui.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  } catch (error) {
    console.error("Invalid MIST amount", error);
    return "0";
  }
}

export function formatAddress(address: string | undefined): string {
  if (!address) return "0x...";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
