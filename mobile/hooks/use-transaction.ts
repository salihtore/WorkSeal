import { useState, useCallback } from 'react';
import { useWalletStore } from '@/lib/wallet-store';
import { signAndExecuteWithZkLogin } from '@/lib/zklogin';
import * as tx from '@/lib/sui-tx';
import { CreateContractInput } from '@/types';

export function useTransaction() {
  const { address } = useWalletStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);

  const createContract = useCallback(async (input: CreateContractInput): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildCreateContractTx({ ...input, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Sözleşme oluşturulurken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const fundContract = useCallback(async (contractId: string, amount: bigint): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildFundContractTx({ contractId, amount, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Sözleşme fonlanırken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const takeJob = useCallback(async (contractId: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildTakeJobTx({ contractId, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'İş alınırken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const submitMilestone = useCallback(async (
    contractId: string,
    index: number,
    proofLink: string,
    proofNotes: string
  ): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildSubmitMilestoneTx({
        contractId,
        milestoneIndex: index,
        proofLink,
        proofNotes,
        senderAddress: address,
      });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Milestone teslim edilirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const rejectMilestone = useCallback(async (contractId: string, index: number, reason: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildRejectMilestoneTx({
        contractId,
        milestoneIndex: index,
        reason,
        senderAddress: address,
      });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Milestone reddedilirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const approveAndRelease = useCallback(async (contractId: string, index: number): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildApproveAndReleaseTx({
        contractId,
        milestoneIndex: index,
        senderAddress: address,
      });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Ödeme onaylanırken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const raiseDispute = useCallback(async (contractId: string, reason: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildRaiseDisputeTx({ contractId, reason, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Anlaşmazlık başlatılırken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const cancelContract = useCallback(async (contractId: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildCancelContractTx({ contractId, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Sözleşme iptal edilirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const sendMessage = useCallback(async (contractId: string, content: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildSendMessageTx({ contractId, content, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Mesaj gönderilirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const resolveDispute = useCallback(async (contractId: string, winnerAddress: string): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildResolveDisputeTx({ contractId, winnerAddress, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Hakem kararı işlenirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  const sendPrivateMessage = useCallback(async (contractId: string, content: string, targetRole: number): Promise<string> => {
    if (!address) throw new Error('Giriş yapılmamış');
    setIsPending(true);
    setError(null);
    try {
      const transaction = tx.buildSendPrivateMessageTx({ contractId, content, targetRole, senderAddress: address });
      const digest = await signAndExecuteWithZkLogin(transaction, address);
      setTxDigest(digest);
      return digest;
    } catch (e: any) {
      setError(e.message || 'Özel mesaj gönderilirken bir hata oluştu.');
      throw e;
    } finally {
      setIsPending(false);
    }
  }, [address]);

  return {
    createContract,
    fundContract,
    takeJob,
    submitMilestone,
    rejectMilestone,
    approveAndRelease,
    raiseDispute,
    resolveDispute,
    cancelContract,
    sendMessage,
    sendPrivateMessage,
    isPending,
    error,
    txDigest,
  };
}
