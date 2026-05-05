import { useState, useEffect } from 'react';
import { getOwnedObjects } from '@/lib/sui-client';
import { useWalletStore } from './use-wallet-store';

import { WORKSEAL_PACKAGE_ID } from '@/constants/config';

export function useContracts() {
  const { address } = useWalletStore();
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setContracts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    getOwnedObjects(address, `${WORKSEAL_PACKAGE_ID}::workseal::Contract`)
      .then((result) => {
        const parsed = (result?.data || [])
          .filter((obj: any) => obj.data?.content?.dataType === 'moveObject')
          .map((obj: any) => {
            const fields = obj.data.content.fields;
            return {
              id: fields.id.id,
              title: fields.title,
              description: fields.description,
              budget: fields.total_budget,
              status: Number(fields.status),
              client: fields.client,
              freelancer: fields.freelancer,
              milestones: (fields.milestones || []).map((m: any) => m.fields || m),
              messages: (fields.messages || []).map((m: any) => m.fields || m),
              created_at: Number(fields.created_at),
              deadline: Number(fields.deadline),
              arbitrator: fields.arbitrator,
            };
          });
        setContracts(parsed);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address]);

  return { contracts, isLoading, error };
}
