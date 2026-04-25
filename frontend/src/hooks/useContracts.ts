import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useCallback, useEffect } from 'react';
import { WORKSEAL_PACKAGE_ID, WORKSEAL_MODULE, ARBITRATOR_REGISTRY_ID } from '@/config/constants';
import { WorkContract, ContractStatus } from '@/types';

export const useContracts = (userAddress?: string | null) => {
  const client = useSuiClient();
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isArbitrator, setIsArbitrator] = useState(false);

  const fetchAllContracts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 0. Hakem listesini çek
      const registryObj = await client.getObject({
        id: ARBITRATOR_REGISTRY_ID,
        options: { showContent: true }
      });
      const arbitrators = (registryObj.data?.content as any)?.fields?.arbitrators || [];
      const arbitratorAddresses = arbitrators.map((a: any) => a.fields.addr.toLowerCase());
      const isUserArb = !!(userAddress && arbitratorAddresses.includes(userAddress.toLowerCase()));
      
      console.log("DEBUG - User Address:", userAddress?.toLowerCase());
      console.log("DEBUG - Arbitrators List:", arbitratorAddresses);
      console.log("DEBUG - Is User Arbitrator?", isUserArb);

      setIsArbitrator(isUserArb);

      // 1. Eventleri bul
      const eventResponse = await client.queryEvents({
        query: {
          MoveEventType: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::ContractCreatedEvent`
        },
        order: 'descending'
      });

      const contractIds = eventResponse.data.map((event: any) => event.parsedJson.contract_id);

      if (contractIds.length === 0) {
        setContracts([]);
        return;
      }

      // 2. Detayları çek
      const objectResponses = await client.multiGetObjects({
        ids: contractIds,
        options: { showContent: true },
      });

      // 3. Pars et ve Filtrele
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
              amount: BigInt(m.fields.amount)
            })),
            dispute_history: (fields.dispute_history || []).map((d: any) => d.fields || d),
            messages: (fields.messages || []).map((msg: any) => msg.fields || msg),
            client_arbitrator_messages: (fields.client_arbitrator_messages || []).map((msg: any) => msg.fields || msg),
            freelancer_arbitrator_messages: (fields.freelancer_arbitrator_messages || []).map((msg: any) => msg.fields || msg),
            arbitrator: fields.arbitrator || null,
          };
        });

      const filtered = allParsed.filter((contract: WorkContract) => {
        const addr = userAddress?.toLowerCase();
        const isClient = addr === contract.client.toLowerCase();
        const isFreelancer = addr === contract.freelancer?.toLowerCase();
        const isAssignedArb = !!(contract.arbitrator && addr === contract.arbitrator.toLowerCase());
        const isDispute = contract.status === ContractStatus.Disputed;

        if (isUserArb && (isDispute || isAssignedArb)) return true;
        if (!contract.freelancer) return true;
        return !!(isClient || isFreelancer || isAssignedArb);
      });

      setContracts(filtered);
    } catch (err: any) {
      console.error("Sözleşmeler çekilirken hata:", err);
      setErrorMessage(err.message || "Sözleşmeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [client, userAddress]);

  // EKLENEN: Otomatik veri çekme (Sidebar gibi yerlerde çalışması için)
  useEffect(() => {
    if (userAddress) {
      fetchAllContracts();
    }
  }, [userAddress, fetchAllContracts]);

  return {
    contracts,
    loading,
    error: errorMessage,
    isArbitrator,
    fetchAllContracts
  };
};