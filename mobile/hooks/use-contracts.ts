import { useQuery } from "@tanstack/react-query";
import { suiClient } from "../lib/sui-client";
import { PACKAGE_ID } from "../constants/config";
import { WorkContract, ContractStatus, Milestone, DisputeRecord } from "../types";
import { useWalletStore } from "./use-wallet-store";

export const useContracts = () => {
  const { address } = useWalletStore();

  const fetchContracts = async (): Promise<WorkContract[]> => {
    try {
      // Query ContractCreatedEvents to get IDs
      const events = await suiClient.queryEvents({
        MoveEventType: `${PACKAGE_ID}::workseal::ContractCreatedEvent`,
      });

      const contractIds = events.data.map((e: any) => e.parsedJson.contract_id);
      if (contractIds.length === 0) return [];

      // Batch fetch objects
      const objects = await suiClient.multiGetObjects(contractIds);
      
      return objects
        .map((obj: any) => parseWorkContract(obj))
        .filter((c: WorkContract | null): c is WorkContract => c !== null);
    } catch (error) {
      console.error("Fetch contracts error:", error);
      return [];
    }
  };

  const parseWorkContract = (obj: any): WorkContract | null => {
    try {
      if (obj.error || !obj.data?.content?.fields) return null;
      const fields = obj.data.content.fields;

      return {
        id: obj.data.objectId,
        title: fields.title,
        description: fields.description,
        freelancer: fields.freelancer,
        client: fields.client,
        total_budget: BigInt(fields.total_budget),
        status: fields.status as ContractStatus,
        deadline: Number(fields.deadline),
        created_at: Number(fields.created_at),
        milestones: fields.milestones.map((m: any) => ({
          title: m.fields.title,
          amount: BigInt(m.fields.amount),
          is_completed: m.fields.is_completed,
          is_paid: m.fields.is_paid,
        })),
        dispute_history: fields.dispute_history.map((d: any) => ({
          raised_by: d.fields.raised_by,
          reason: d.fields.reason,
          timestamp: Number(d.fields.timestamp),
        })),
      };
    } catch (e) {
      console.error("Parse error:", e);
      return null;
    }
  };

  const { data: allContracts = [], isLoading, refetch } = useQuery({
    queryKey: ["contracts"],
    queryFn: fetchContracts,
    refetchInterval: 10000,
  });

  const getMyContracts = () => {
    if (!address) return [];
    return allContracts.filter(
      (c) => c.client === address || c.freelancer === address
    );
  };

  const getOpenJobs = () => {
    return allContracts.filter(
      (c) => c.freelancer === "0x0000000000000000000000000000000000000000000000000000000000000000" && c.status === ContractStatus.Created
    );
  };

  const getContractById = (id: string) => {
    return allContracts.find((c) => c.id === id);
  };

  return {
    allContracts,
    getMyContracts,
    getOpenJobs,
    getContractById,
    isLoading,
    refetch,
  };
};
