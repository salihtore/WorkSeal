/**
 * Sui Transaction Builders for WorkSeal
 * Returns structured transaction data for the mobile wallet bridge.
 */

export const WORKSEAL_PACKAGE_ID = "0x347761a22dd046d6c4b34b17a35fe388c644c8315bf5830d28bcf9429c4c4e86";
export const WORKSEAL_MODULE = "workseal";
export const CLOCK_OBJECT_ID = "0x6";
export const ARBITRATOR_REGISTRY_ID = "0x9871edff64acc2ae51fe5f637a15c5051ad1921c2cfeb86efb9007ced3421dd8";

export interface TransactionData {
  target: string;
  arguments: any[];
  typeArguments?: string[];
}

export const SuiTx = {
  /**
   * Create a new contract
   */
  createContract: (
    title: string,
    description: string,
    client: string,
    deadline: number,
    milestoneTitles: string[],
    milestoneAmounts: string[]
  ): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::create_contract`,
    arguments: [title, description, client, deadline.toString(), milestoneTitles, milestoneAmounts, CLOCK_OBJECT_ID],
  }),

  /**
   * Freelancer takes an open job
   */
  takeJob: (contractId: string): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::take_job`,
    arguments: [contractId],
  }),

  /**
   * Client funds the contract
   */
  fundContract: (contractId: string, amount: string): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::fund_contract`,
    arguments: [contractId, amount], // In real PTB, 'amount' would be a splitCoin result
  }),

  /**
   * Freelancer submits a milestone proof
   */
  submitMilestone: (
    contractId: string, 
    index: number, 
    link: string, 
    notes: string
  ): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::submit_milestone`,
    arguments: [contractId, index.toString(), link, notes],
  }),

  /**
   * Client approves milestone and releases funds
   */
  approveAndRelease: (contractId: string, index: number): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::approve_and_release_funds`,
    arguments: [contractId, index.toString()],
  }),

  /**
   * Raise a dispute
   */
  raiseDispute: (contractId: string, reason: string): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::raise_dispute`,
    arguments: [contractId, ARBITRATOR_REGISTRY_ID, reason, CLOCK_OBJECT_ID],
  }),

  /**
   * Send a message
   */
  sendMessage: (contractId: string, content: string): TransactionData => ({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::send_message`,
    arguments: [contractId, content, CLOCK_OBJECT_ID],
  }),
};
