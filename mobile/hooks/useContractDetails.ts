/**
 * useContractDetails — mirrors frontend/src/hooks/useContractDetails.ts
 */

import { useState, useEffect } from 'react';
import { suiClient } from '@/lib/sui-client';
import { WorkContract, ContractStatus } from '@/types';

export const useContractDetails = (contractId: string | null) => {
  const [contract, setContract] = useState<WorkContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await suiClient.getObject({
          id: contractId,
          options: { showContent: true },
        });

        if (res.error) {
          throw new Error(res.error.code);
        }

        if (res.data?.content?.dataType === 'moveObject') {
          const fields = res.data.content.fields as any;

          const parsedContract: WorkContract = {
            id: fields.id.id,
            title: fields.title,
            description: fields.description,
            freelancer:
              typeof fields.freelancer === 'string'
                ? fields.freelancer
                : fields.freelancer?.fields?.id || fields.freelancer || null,
            client:
              typeof fields.client === 'string'
                ? fields.client
                : fields.client?.fields?.id || fields.client,
            total_budget: BigInt(fields.total_budget),
            status: Number(fields.status) as ContractStatus,
            deadline: Number(fields.deadline),
            created_at: Number(fields.created_at),

            milestones: (fields.milestones as any[]).map((m: any) => ({
              title: m.fields.title,
              amount: BigInt(m.fields.amount),
              is_completed: m.fields.is_completed,
              is_paid: m.fields.is_paid,
              proof_link: m.fields.proof_link || undefined,
              proof_notes: m.fields.proof_notes || undefined,
            })),

            dispute_history: (fields.dispute_history as any[]).map((d: any) => ({
              raised_by: d.fields.raised_by,
              reason: d.fields.reason,
              timestamp: Number(d.fields.timestamp),
            })),

            messages: (fields.messages ? (fields.messages as any[]) : []).map(
              (msg: any) => ({
                sender: msg.fields.sender,
                content: msg.fields.content,
                timestamp: Number(msg.fields.timestamp),
              })
            ),

            client_arbitrator_messages: (
              fields.client_arbitrator_messages
                ? (fields.client_arbitrator_messages as any[])
                : []
            ).map((msg: any) => ({
              sender: msg.fields.sender,
              content: msg.fields.content,
              timestamp: Number(msg.fields.timestamp),
            })),

            freelancer_arbitrator_messages: (
              fields.freelancer_arbitrator_messages
                ? (fields.freelancer_arbitrator_messages as any[])
                : []
            ).map((msg: any) => ({
              sender: msg.fields.sender,
              content: msg.fields.content,
              timestamp: Number(msg.fields.timestamp),
            })),

            arbitrator: fields.arbitrator || null,
          };

          setContract(parsedContract);
        }
      } catch (err: any) {
        console.error('Sözleşme verisi çekilemedi:', err);
        setError(err.message || 'Bilinmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const refetch = async () => {
    if (!contractId) return;
    setLoading(true);
    // Re-trigger useEffect by calling fetchContract directly
    try {
      const res = await suiClient.getObject({
        id: contractId,
        options: { showContent: true },
      });
      if (res.data?.content?.dataType === 'moveObject') {
        const fields = res.data.content.fields as any;
        setContract((prev) => prev ? { ...prev, ...fields } : null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { contract, loading, error, refetch };
};
