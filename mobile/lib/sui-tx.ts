import { Transaction } from '@mysten/sui/transactions';
import { WORKSEAL_PACKAGE_ID, WORKSEAL_MODULE, CLOCK_OBJECT_ID, ARBITRATOR_REGISTRY_ID } from '@/constants/config';

export const PACKAGE_ID = WORKSEAL_PACKAGE_ID;
export const CLOCK_ID = CLOCK_OBJECT_ID;
export const REGISTRY_ID = ARBITRATOR_REGISTRY_ID;

export function buildCreateContractTx(params: {
  title: string;
  description: string;
  client: string;
  deadline_ms: number;
  milestone_titles: string[];
  milestone_amounts: bigint[];
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  const amountsAsString = params.milestone_amounts.map((a) => a.toString());

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::create_contract`,
    arguments: [
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      tx.pure.address(params.client),
      tx.pure.u64(params.deadline_ms),
      tx.pure.vector('string', params.milestone_titles),
      tx.pure.vector('u64', amountsAsString),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}

export function buildFundContractTx(params: {
  contractId: string;
  amount: bigint;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(params.amount))]);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::fund_contract`,
    arguments: [tx.object(params.contractId), coin],
  });

  return tx;
}

export function buildTakeJobTx(params: {
  contractId: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::take_job`,
    arguments: [tx.object(params.contractId)],
  });

  return tx;
}

export function buildSubmitMilestoneTx(params: {
  contractId: string;
  milestoneIndex: number;
  proofLink: string;
  proofNotes: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::submit_milestone`,
    arguments: [
      tx.object(params.contractId),
      tx.pure.u64(params.milestoneIndex),
      tx.pure.string(params.proofLink),
      tx.pure.string(params.proofNotes),
    ],
  });

  return tx;
}

export function buildRejectMilestoneTx(params: {
  contractId: string;
  milestoneIndex: number;
  reason: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::reject_milestone`,
    arguments: [
      tx.object(params.contractId),
      tx.pure.u64(params.milestoneIndex),
      tx.pure.string(params.reason),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}

export function buildApproveAndReleaseTx(params: {
  contractId: string;
  milestoneIndex: number;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::approve_and_release_funds`,
    arguments: [tx.object(params.contractId), tx.pure.u64(params.milestoneIndex)],
  });

  return tx;
}

export function buildRaiseDisputeTx(params: {
  contractId: string;
  reason: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::raise_dispute`,
    arguments: [
      tx.object(params.contractId),
      tx.object(REGISTRY_ID),
      tx.pure.string(params.reason),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}

export function buildCancelContractTx(params: {
  contractId: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::cancel_contract`,
    arguments: [tx.object(params.contractId)],
  });

  return tx;
}

export function buildSendMessageTx(params: {
  contractId: string;
  content: string;
  senderAddress: string;
}): Transaction {
  const tx = new Transaction();
  tx.setSender(params.senderAddress);

  tx.moveCall({
    target: `${PACKAGE_ID}::${WORKSEAL_MODULE}::send_message`,
    arguments: [
      tx.object(params.contractId),
      tx.pure.string(params.content),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}
