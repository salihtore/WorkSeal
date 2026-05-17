import { useCallback, useState } from 'react';
import { openContractActionInSlush, openNewContractInSlush } from '@/lib/slush-links';
import { CreateContractInput } from '@/types';

type PendingAction =
  | 'create'
  | 'fund'
  | 'take'
  | 'submit'
  | 'reject'
  | 'approve'
  | 'dispute'
  | 'cancel'
  | 'message';

export function useTransaction() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txDigest] = useState<string | null>(null);

  const openSlushAction = useCallback(
    async (_actionName: PendingAction, fn: () => Promise<void>): Promise<string> => {
      setIsPending(true);
      setError(null);
      try {
        await fn();
        return 'slush-redirect';
      } catch (e: any) {
        const message = e?.message || 'Slush Wallet acilamadi.';
        setError(message);
        throw new Error(message);
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  const createContract = useCallback(async (_input?: CreateContractInput): Promise<string> => {
    return openSlushAction('create', () => openNewContractInSlush());
  }, [openSlushAction]);

  const fundContract = useCallback(async (contractId: string, _amount?: bigint): Promise<string> => {
    return openSlushAction('fund', () => openContractActionInSlush(contractId, 'fund'));
  }, [openSlushAction]);

  const takeJob = useCallback(async (contractId: string): Promise<string> => {
    return openSlushAction('take', () => openContractActionInSlush(contractId, 'take'));
  }, [openSlushAction]);

  const submitMilestone = useCallback(async (
    contractId: string,
    index: number,
    proofLink: string,
    proofNotes: string
  ): Promise<string> => {
    return openSlushAction('submit', () =>
      openContractActionInSlush(contractId, 'submit', {
        milestone: index,
        proofLink,
        proofNotes,
      })
    );
  }, [openSlushAction]);

  const rejectMilestone = useCallback(async (
    contractId: string,
    index: number,
    reason: string
  ): Promise<string> => {
    return openSlushAction('reject', () =>
      openContractActionInSlush(contractId, 'reject', { milestone: index, reason })
    );
  }, [openSlushAction]);

  const approveAndRelease = useCallback(async (contractId: string, index: number): Promise<string> => {
    return openSlushAction('approve', () =>
      openContractActionInSlush(contractId, 'approve', { milestone: index })
    );
  }, [openSlushAction]);

  const raiseDispute = useCallback(async (contractId: string, reason: string): Promise<string> => {
    return openSlushAction('dispute', () =>
      openContractActionInSlush(contractId, 'dispute', { reason })
    );
  }, [openSlushAction]);

  const cancelContract = useCallback(async (contractId: string): Promise<string> => {
    return openSlushAction('cancel', () => openContractActionInSlush(contractId, 'cancel'));
  }, [openSlushAction]);

  const sendMessage = useCallback(async (contractId: string, content: string): Promise<string> => {
    return openSlushAction('message', () =>
      openContractActionInSlush(contractId, 'message', { content })
    );
  }, [openSlushAction]);

  return {
    createContract,
    fundContract,
    takeJob,
    submitMilestone,
    rejectMilestone,
    approveAndRelease,
    raiseDispute,
    cancelContract,
    sendMessage,
    isPending,
    error,
    txDigest,
  };
}
