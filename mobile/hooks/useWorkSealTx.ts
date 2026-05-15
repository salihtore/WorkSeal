/**
 * useWorkSealTx — transaction dispatch hook.
 * Builds PTBs and routes them to Slush Wallet via WalletConnect for signing.
 * All tx builders are in lib/sui-tx.ts (1:1 with web).
 */

import { Alert } from 'react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { signAndExecuteWithZkLogin } from '@/lib/zklogin';
import {
  buildCreateContractTx,
  buildFundContractTx,
  buildSubmitMilestoneTx,
  buildApproveAndReleaseFundsTx,
  buildRaiseDisputeTx,
  buildRejectMilestoneTx,
  buildCancelContractTx,
  buildTakeJobTx,
  buildSendMessageTx,
  buildSendPrivateMessageTx,
  buildResolveDisputeTx,
  buildResumeContractArbitratorTx,
  buildRegisterArbitratorTx,
} from '@/lib/sui-tx';
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

export const useWorkSealTx = () => {
  const { address } = useWalletStore();

  const requireWallet = () => {
    if (!address) {
      Alert.alert('Cüzdan Bağlı Değil', 'Bu işlemi yapmak için önce Slush Wallet bağlanın.');
      throw new Error('Wallet not connected');
    }
    return address;
  };

  const dispatch = async (txBuilder: () => ReturnType<typeof buildCreateContractTx>) => {
    const addr = requireWallet();
    const tx = txBuilder();
    await signAndExecuteWithZkLogin(tx, addr);
  };

  return {
    createContract: (input: CreateContractInput) =>
      dispatch(() => buildCreateContractTx(input)),

    fundContract: (input: FundContractInput) =>
      dispatch(() => buildFundContractTx(input)),

    submitMilestone: (input: SubmitMilestoneInput) =>
      dispatch(() => buildSubmitMilestoneTx(input)),

    approveAndReleaseFunds: (input: ApproveAndReleaseFundsInput) =>
      dispatch(() => buildApproveAndReleaseFundsTx(input)),

    raiseDispute: (input: RaiseDisputeInput) =>
      dispatch(() => buildRaiseDisputeTx(input)),

    rejectMilestone: (input: RejectMilestoneInput) =>
      dispatch(() => buildRejectMilestoneTx(input)),

    cancelContract: (input: CancelContractInput) =>
      dispatch(() => buildCancelContractTx(input)),

    takeJob: (contractId: string) =>
      dispatch(() => buildTakeJobTx(contractId)),

    sendMessage: (input: SendMessageInput) =>
      dispatch(() => buildSendMessageTx(input)),

    sendPrivateMessage: (input: SendPrivateMessageInput) =>
      dispatch(() => buildSendPrivateMessageTx(input)),

    resolveDispute: (input: ResolveDisputeInput) =>
      dispatch(() => buildResolveDisputeTx(input)),

    resumeContractArbitrator: (input: ResumeContractInput) =>
      dispatch(() => buildResumeContractArbitratorTx(input)),

    registerArbitrator: (arbitratorAddress: string, maxJobs: number, adminCapId: string) =>
      dispatch(() => buildRegisterArbitratorTx(adminCapId, arbitratorAddress, maxJobs)),
  };
};
