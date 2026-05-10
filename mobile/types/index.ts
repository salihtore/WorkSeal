import { COLORS } from "../constants/colors";

export enum ContractStatus {
  Created = 0,
  Active = 1,
  Completed = 2,
  Disputed = 3,
}

export interface Milestone {
  title: string;
  amount: bigint;
  is_completed: boolean;
  is_paid: boolean;
}

export interface DisputeRecord {
  raised_by: string;
  reason: string;
  timestamp: number;
}

export interface WorkContract {
  id: string;
  title: string;
  description: string;
  freelancer: string;
  client: string;
  total_budget: bigint;
  status: ContractStatus;
  milestones: Milestone[];
  deadline: number;
  created_at: number;
  dispute_history: DisputeRecord[];
}

export interface UserProfile {
  wallet_address: string;
  is_anonymous: boolean;
  name: string | null;
  bio: string | null;
  skills: string[] | null;
  avatar: string | null;
  created_at: string;
}

export interface CreateContractInput {
  title: string;
  description: string;
  client: string;
  deadline_ms: number;
  milestone_titles: string[];
  milestone_amounts: bigint[];
}

// Helper functions
export function mistToSui(mist: bigint | number | string): string {
  const value = BigInt(mist);
  const sui = Number(value) / 1_000_000_000;
  return sui.toLocaleString("en-US", { maximumFractionDigits: 9 });
}

export function suiToMist(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

export function getStatusLabel(status: ContractStatus): string {
  switch (status) {
    case ContractStatus.Created:
      return "Bekliyor";
    case ContractStatus.Active:
      return "Aktif";
    case ContractStatus.Completed:
      return "Tamamlandı";
    case ContractStatus.Disputed:
      return "Anlaşmazlık";
    default:
      return "Bilinmiyor";
  }
}

export function getStatusColors(status: ContractStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case ContractStatus.Created:
      return {
        bg: COLORS.secondary,
        text: COLORS.muted,
        border: COLORS.border,
      };
    case ContractStatus.Active:
      return {
        bg: COLORS.primaryLight,
        text: COLORS.primary,
        border: COLORS.primary,
      };
    case ContractStatus.Completed:
      return {
        bg: COLORS.successLight,
        text: COLORS.success,
        border: COLORS.success,
      };
    case ContractStatus.Disputed:
      return {
        bg: COLORS.destructiveLight,
        text: COLORS.destructive,
        border: COLORS.destructive,
      };
    default:
      return {
        bg: COLORS.secondary,
        text: COLORS.muted,
        border: COLORS.border,
      };
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
