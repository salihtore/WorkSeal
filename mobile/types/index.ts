// ========= ENUMS =========

export enum ContractStatus {
  Created = 0,    // Olusturuldu, fonlanmadı
  Active = 1,     // Fonlandı, devam ediyor
  Completed = 2,  // Tüm milestoneler ödendi veya anlaşmazlık çözüldü
  Disputed = 3,   // Anlasmazlık acıldı
  Cancelled = 4,  // Iptal edildi
}

// ========= CORE TYPES =========

export interface Milestone {
  title: string;
  amount: bigint;        // MIST cinsinden (1 SUI = 1_000_000_000 MIST)
  is_completed: boolean;
  is_paid: boolean;
  proof_link?: string;
  proof_notes?: string;
}

export interface DisputeRecord {
  raised_by: string;     // Sui wallet adresi
  reason: string;
  timestamp: number;     // Unix ms
}

export interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

export interface WorkContract {
  id: string;            // Sui object ID
  title: string;
  description: string;
  freelancer?: string;    // Sui wallet adresi
  client: string;        // Sui wallet adresi
  total_budget: bigint;  // MIST cinsinden
  status: ContractStatus;
  milestones: Milestone[];
  deadline: number;      // Unix ms
  created_at: number;    // Unix ms
  dispute_history: DisputeRecord[];
  messages: Message[];
  client_arbitrator_messages: Message[];
  freelancer_arbitrator_messages: Message[];
  arbitrator?: string;
}

export interface ArbitratorProfile {
  addr: string;
  current_jobs: number;
  max_jobs: number;
  is_active: boolean;
}

// ========= EVENT TYPES =========

export interface ContractCreatedEvent {
  contract_id: string;
  creator: string;
  client: string;
}

export interface ContractFundedEvent {
  contract_id: string;
  amount: bigint;
}

export interface PaymentReleasedEvent {
  contract_id: string;
  freelancer: string;
  amount: bigint;
}

export interface DisputeRaisedEvent {
  contract_id: string;
  raised_by: string;
  reason: string;
}

export interface MilestoneRejectedEvent {
  contract_id: string;
  milestone_index: number;
  reason: string;
}

export interface ContractCancelledEvent {
  contract_id: string;
  client: string;
}

export interface DisputeResolvedEvent {
  contract_id: string;
  winner: string;
  amount: bigint;
}

export interface ArbitratorAssignedEvent {
  contract_id: string;
  arbitrator: string;
}

export interface ContractResumedEvent {
  contract_id: string;
  arbitrator: string;
}

// ========= TRANSACTION INPUT TYPES =========

export interface CreateContractInput {
  title: string;
  description: string;
  client: string;
  deadline_ms: number;
  milestone_titles: string[];
  milestone_amounts: bigint[];
}

export interface FundContractInput {
  contract_id: string;
  amount: bigint;
}

export interface SubmitMilestoneInput {
  contract_id: string;
  milestone_index: number;
  proof_link: string;
  proof_notes: string;
}

export interface ApproveAndReleaseFundsInput {
  contract_id: string;
  milestone_index: number;
}

export interface RaiseDisputeInput {
  contract_id: string;
  reason: string;
}

export interface RejectMilestoneInput {
  contract_id: string;
  milestone_index: number;
  reason: string;
}

export interface CancelContractInput {
  contract_id: string;
}

export interface ResolveDisputeInput {
  contract_id: string;
  winner: string;
  admin_cap_id?: string;
}

export interface ProposeArbitratorInput {
  contract_id: string;
  arbitrator_address: string;
}

export interface SendMessageInput {
  contract_id: string;
  content: string;
}

export interface SendPrivateMessageInput {
  contract_id: string;
  content: string;
  target_role: number; // 0: Client, 1: Freelancer
}

export interface ResumeContractInput {
  contract_id: string;
}

// ========= UI HELPER TYPES =========

export interface ContractSummary {
  id: string;
  title: string;
  counterparty: string;
  counterpartyName?: string;
  counterpartyVerified: boolean;
  total_budget: bigint;
  status: ContractStatus;
  deadline: number;
  created_at: number;
  completedMilestones: number;
  totalMilestones: number;
}

export interface MilestoneSummary {
  index: number;
  title: string;
  amount: bigint;
  is_completed: boolean;
  is_paid: boolean;
  percentOfTotal: number;
}

// ========= UTILS =========

export const MIST_PER_SUI = BigInt(1_000_000_000);

export function mistToSui(mist: bigint | string | number): string {
  const sui = Number(mist) / Number(MIST_PER_SUI);
  return sui.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

export function suiToMist(sui: number): bigint {
  return BigInt(Math.floor(sui * Number(MIST_PER_SUI)));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimestampFull(ms: number): string {
  return new Date(ms).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusLabel(status: ContractStatus): string {
  switch (status) {
    case ContractStatus.Created: return 'Olusturuldu';
    case ContractStatus.Active: return 'Aktif';
    case ContractStatus.Completed: return 'Tamamlandı';
    case ContractStatus.Disputed: return 'Anlasmazlık';
    case ContractStatus.Cancelled: return 'İptal Edildi';
    default: return 'Bilinmiyor';
  }
}

export function getStatusColor(status: ContractStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case ContractStatus.Created:
      return { bg: 'rgba(234,179,8,0.1)', text: '#EAB308', border: 'rgba(234,179,8,0.2)' };
    case ContractStatus.Active:
      return { bg: 'rgba(79,195,247,0.1)', text: '#4FC3F7', border: 'rgba(79,195,247,0.2)' };
    case ContractStatus.Completed:
      return { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.2)' };
    case ContractStatus.Disputed:
      return { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.2)' };
    case ContractStatus.Cancelled:
      return { bg: 'rgba(100,116,139,0.1)', text: '#64748B', border: 'rgba(100,116,139,0.2)' };
    default:
      return { bg: 'rgba(100,116,139,0.1)', text: '#64748B', border: 'rgba(100,116,139,0.2)' };
  }
}
