import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { WorkContract, ContractStatus, Milestone, DisputeRecord } from '@/types';

export const useContractDetails = (contractId: string) => {
  const client = useSuiClient();
  const [contract, setContract] = useState<WorkContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) return;
      
      try {
        setLoading(true);
        const res = await client.getObject({
          id: contractId,
          options: { showContent: true },
        });

        if (res.error) {
          throw new Error(res.error.code);
        }

        if (res.data?.content?.dataType === 'moveObject') {
          const fields = res.data.content.fields as any;
          
          // RPC'den gelen veriyi senin WorkContract tipine mapliyoruz
          const parsedContract: WorkContract = {
            id: fields.id.id,
            title: fields.title,
            description: fields.description,
            freelancer: typeof fields.freelancer === 'string' ? fields.freelancer : (fields.freelancer?.fields?.id || fields.freelancer || null),
            client: typeof fields.client === 'string' ? fields.client : (fields.client?.fields?.id || fields.client),
            total_budget: BigInt(fields.total_budget), // String to BigInt
            status: Number(fields.status) as ContractStatus,
            deadline: Number(fields.deadline),
            created_at: Number(fields.created_at),
            
            milestones: (fields.milestones as any[]).map((m: any) => ({
              title: m.fields.title,
              amount: BigInt(m.fields.amount),
              is_completed: m.fields.is_completed,
              is_paid: m.fields.is_paid,
              proof_link: m.fields.proof_link,
              proof_notes: m.fields.proof_notes,
            })),

            dispute_history: (fields.dispute_history as any[]).map((d: any) => ({
              raised_by: d.fields.raised_by,
              reason: d.fields.reason,
              timestamp: Number(d.fields.timestamp),
            })),

            messages: (fields.messages ? (fields.messages as any[]) : []).map((msg: any) => ({
              sender: msg.fields.sender,
              content: msg.fields.content,
              timestamp: Number(msg.fields.timestamp),
            })),
            client_arbitrator_messages: (fields.client_arbitrator_messages ? (fields.client_arbitrator_messages as any[]) : []).map((msg: any) => ({
              sender: msg.fields.sender,
              content: msg.fields.content,
              timestamp: Number(msg.fields.timestamp),
            })),
            freelancer_arbitrator_messages: (fields.freelancer_arbitrator_messages ? (fields.freelancer_arbitrator_messages as any[]) : []).map((msg: any) => ({
              sender: msg.fields.sender,
              content: msg.fields.content,
              timestamp: Number(msg.fields.timestamp),
            })),
            arbitrator: fields.arbitrator || null,
          };

          setContract(parsedContract);
        }
      } catch (err: any) {
        console.error("Sözleşme verisi çekilemedi:", err);
        setError(err.message || "Bilinmeyen bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, client]);

  return { contract, loading, error };
};