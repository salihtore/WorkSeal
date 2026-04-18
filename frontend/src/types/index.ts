// Common Types for WorkSeal Frontend

export type SuiAddress = string; // Matches ^0x[a-fA-F0-9]{64}$
export type ObjectId = string;

export interface Milestone {
  id: string; // Internal id for React state tracking
  title: string;
  amount: string; // Initially string for form input, will be parsed to MIST BigInt before TX
  deadline: string; // YYYY-MM-DD
}

export type DisputeStatus = "open" | "resolved" | "escalated";
export type ContractStatus = "draft" | "active" | "pending" | "completed" | "dispute";
export type IdentityPreference = "any" | "verified" | "anonymous";

export interface ContractFormData {
  title: string;
  description: string;
  clientWallet: string;
  deadline: string;
  identityPreference: IdentityPreference;
  milestones: Milestone[];
}

export interface Contract {
  id: ObjectId;
  title: string;
  description: string;
  creator: SuiAddress;
  client: SuiAddress;
  status: ContractStatus;
  budget: string; // Raw sui values for now, but typed correctly in real chain
  createdAt: string;
}
