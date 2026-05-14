/**
 * Transaction Builders — 1:1 parity with frontend/src/hooks/useWorkSealTransactions.ts
 *
 * Each function builds a Transaction object ready to be signed.
 * Signing is done via Slush Wallet (signAndExecuteViaSlush).
 */

import { Transaction } from '@mysten/sui/transactions';
import {
  WORKSEAL_PACKAGE_ID,
  WORKSEAL_MODULE,
  CLOCK_OBJECT_ID,
  ARBITRATOR_REGISTRY_ID,
} from '@/constants/config';
import {
  CreateContractInput,
  FundContractInput,
  SubmitMilestoneInput,
  ApproveAndReleaseFundsInput,
  RaiseDisputeInput,
  RejectMilestoneInput,
  CancelContractInput,
  ResolveDisputeInput,
  SendMessageInput,
  SendPrivateMessageInput,
  ResumeContractInput,
} from '@/types';

// ========= CONTRACT FUNCTIONS =========

export function buildCreateContractTx(input: CreateContractInput): Transaction {
  const tx = new Transaction();
  const amountsAsString = input.milestone_amounts.map((a) => a.toString());

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::create_contract`,
    arguments: [
      tx.pure.string(input.title),
      tx.pure.string(input.description),
      tx.pure.address(input.client),
      tx.pure.u64(input.deadline_ms),
      tx.pure.vector('string', input.milestone_titles),
      tx.pure.vector('u64', amountsAsString),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

export function buildFundContractTx(input: FundContractInput): Transaction {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(input.amount.toString())]);

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::fund_contract`,
    arguments: [tx.object(input.contract_id), paymentCoin],
  });

  return tx;
}

export function buildSubmitMilestoneTx(input: SubmitMilestoneInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::submit_milestone`,
    arguments: [
      tx.object(input.contract_id),
      tx.pure.u64(input.milestone_index),
      tx.pure.string(input.proof_link),
      tx.pure.string(input.proof_notes),
    ],
  });

  return tx;
}

export function buildApproveAndReleaseFundsTx(input: ApproveAndReleaseFundsInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::approve_and_release_funds`,
    arguments: [tx.object(input.contract_id), tx.pure.u64(input.milestone_index)],
  });

  return tx;
}

export function buildRaiseDisputeTx(input: RaiseDisputeInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::raise_dispute`,
    arguments: [
      tx.object(input.contract_id),
      tx.object(ARBITRATOR_REGISTRY_ID),
      tx.pure.string(input.reason),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

export function buildRejectMilestoneTx(input: RejectMilestoneInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::reject_milestone`,
    arguments: [
      tx.object(input.contract_id),
      tx.pure.u64(input.milestone_index),
      tx.pure.string(input.reason),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

export function buildCancelContractTx(input: CancelContractInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::cancel_contract`,
    arguments: [tx.object(input.contract_id)],
  });

  return tx;
}

export function buildTakeJobTx(contractId: string): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::take_job`,
    arguments: [tx.object(contractId)],
  });

  return tx;
}

export function buildSendMessageTx(input: SendMessageInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::send_message`,
    arguments: [
      tx.object(input.contract_id),
      tx.pure.string(input.content),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

export function buildSendPrivateMessageTx(input: SendPrivateMessageInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::send_private_message`,
    arguments: [
      tx.object(input.contract_id),
      tx.pure.string(input.content),
      tx.pure.u8(input.target_role),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  return tx;
}

export function buildResolveDisputeTx(input: ResolveDisputeInput): Transaction {
  const tx = new Transaction();

  if (input.admin_cap_id) {
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resolve_dispute_admin`,
      arguments: [
        tx.object(input.admin_cap_id),
        tx.object(ARBITRATOR_REGISTRY_ID),
        tx.object(input.contract_id),
        tx.pure.address(input.winner),
      ],
    });
  } else {
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resolve_dispute_arbitrator`,
      arguments: [
        tx.object(ARBITRATOR_REGISTRY_ID),
        tx.object(input.contract_id),
        tx.pure.address(input.winner),
      ],
    });
  }

  return tx;
}

export function buildResumeContractArbitratorTx(input: ResumeContractInput): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resume_contract_arbitrator`,
    arguments: [tx.object(input.contract_id)],
  });

  return tx;
}

export function buildRegisterArbitratorTx(
  adminCapId: string,
  arbitratorAddress: string,
  maxJobs: number
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::register_arbitrator`,
    arguments: [
      tx.object(adminCapId),
      tx.object(ARBITRATOR_REGISTRY_ID),
      tx.pure.address(arbitratorAddress),
      tx.pure.u64(maxJobs),
    ],
  });

  return tx;
}
