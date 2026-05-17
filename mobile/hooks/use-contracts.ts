import { useState, useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { suiClient } from '@/lib/sui-client';
import { WORKSEAL_PACKAGE_ID, WORKSEAL_MODULE, ARBITRATOR_REGISTRY_ID } from '@/constants/config';
import { WorkContract, ContractStatus } from '@/types';

export function useContracts(userAddress?: string | null) {
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isArbitrator, setIsArbitrator] = useState(false);

  const fetchAllContracts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 0. Hakem listesini çek
      const registryObj = await suiClient.getObject({
        id: ARBITRATOR_REGISTRY_ID,
        options: { showContent: true },
      });
      const arbitrators = (registryObj.data?.content as any)?.fields?.arbitrators || [];
      const arbitratorAddresses = arbitrators.map((a: any) =>
        a.fields.addr.toLowerCase()
      );
      const isUserArb = !!(
        userAddress && arbitratorAddresses.includes(userAddress.toLowerCase())
      );
      setIsArbitrator(isUserArb);

      // 1. Eventleri bul
      const eventResponse = await suiClient.queryEvents({
        query: {
          MoveEventType: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::ContractCreatedEvent`,
        },
        order: 'descending',
      });

      const contractIds = eventResponse.data.map(
        (event: any) => event.parsedJson.contract_id
      );

      if (contractIds.length === 0) {
        setContracts([]);
        return;
      }

      // 2. Detayları çek
      const objectResponses = await suiClient.multiGetObjects({
        ids: contractIds,
        options: { showContent: true },
      });

      // 3. Parse et
      const allParsed: WorkContract[] = objectResponses
        .filter((res) => res.data?.content?.dataType === 'moveObject')
        .map((res: any) => {
          const fields = res.data.content.fields;
          return {
            id: fields.id.id,
            title: fields.title,
            description: fields.description,
            freelancer: fields.freelancer ? fields.freelancer : null,
            client: fields.client,
            total_budget: BigInt(fields.total_budget),
            status: Number(fields.status) as ContractStatus,
            deadline: Number(fields.deadline),
            created_at: Number(fields.created_at),
            milestones: (fields.milestones || []).map((m: any) => ({
              ...m.fields,
              amount: BigInt(m.fields.amount),
            })),
            dispute_history: (fields.dispute_history || []).map(
              (d: any) => d.fields || d
            ),
            messages: (fields.messages || []).map((msg: any) => msg.fields || msg),
            client_arbitrator_messages: (
              fields.client_arbitrator_messages || []
            ).map((msg: any) => msg.fields || msg),
            freelancer_arbitrator_messages: (
              fields.freelancer_arbitrator_messages || []
            ).map((msg: any) => msg.fields || msg),
            arbitrator: fields.arbitrator || null,
          };
        });

      setContracts(allParsed);
    } catch (err: any) {
      console.error('[useContracts] Sözleşmeler çekilirken hata:', err);
      setErrorMessage(err.message || 'Sözleşmeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchAllContracts();
  }, [fetchAllContracts]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchAllContracts();
      }
    });

    return () => subscription.remove();
  }, [fetchAllContracts]);

  // Yardımcı filtreler (Görev 3 ve UI gereksinimleri)
  const getMyContracts = useCallback(() => {
    if (!userAddress) return [];
    const addr = userAddress.toLowerCase();
    return contracts.filter((c) => {
      const isClient = c.client.toLowerCase() === addr;
      const isFreelancer = c.freelancer?.toLowerCase() === addr;
      return isClient || isFreelancer;
    });
  }, [contracts, userAddress]);

  const getOpenJobs = useCallback(() => {
    return contracts.filter((c) => c.freelancer === null && c.status === ContractStatus.Active);
  }, [contracts]);

  const getContractById = useCallback((id: string) => {
    return contracts.find((c) => c.id === id) || null;
  }, [contracts]);

  return {
    contracts,
    loading,
    error: errorMessage,
    isArbitrator,
    fetchAllContracts,
    getMyContracts,
    getOpenJobs,
    getContractById,
  };
}
