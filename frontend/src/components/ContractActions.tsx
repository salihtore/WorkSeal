// src/components/ContractActions.tsx
import { useCurrentAccount } from "@mysten/dapp-kit";
import { WorkContract, ContractStatus, MilestoneSummary } from "../types";
import { useWorkSealTransactions } from "../hooks/useWorkSealTransactions";

interface Props {
  contract: WorkContract;
  milestoneIndex: number;
}

export const ContractActions = ({ contract, milestoneIndex }: Props) => {
  const account = useCurrentAccount();
  const { fundContract, submitMilestone, approveAndReleaseFunds } = useWorkSealTransactions();

  if (!account) return null;

  const isClient = account.address === contract.client;
  const isFreelancer = account.address === contract.freelancer;
  const milestone = contract.milestones[milestoneIndex];

  // 1. Durum: Sözleşme oluşturuldu, Müşteri para yatırmalı
  if (contract.status === ContractStatus.Created && isClient) {
    return (
      <button 
        onClick={() => fundContract({ contract_id: contract.id, amount: contract.total_budget })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sözleşmeyi Fonla
      </button>
    );
  }

  // 2. Durum: Sözleşme Aktif, Freelancer işi teslim etmeli
  if (contract.status === ContractStatus.Active && isFreelancer && !milestone.is_completed) {
    return (
      <button 
        onClick={() => submitMilestone({ 
          contract_id: contract.id, 
          milestone_index: milestoneIndex,
          proof_link: "",
          proof_notes: ""
        })}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Aşamayı Teslim Et
      </button>
    );
  }

  // 3. Durum: İş teslim edildi, Müşteri onaylayıp parayı serbest bırakmalı
  if (contract.status === ContractStatus.Active && isClient && milestone.is_completed && !milestone.is_paid) {
    return (
      <button 
        onClick={() => approveAndReleaseFunds({ contract_id: contract.id, milestone_index: milestoneIndex })}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Onayla ve Öde
      </button>
    );
  }

  // Eğer tamamlanmışsa
  if (milestone.is_paid) {
    return <span className="text-green-500 font-bold">Ödendi ✅</span>;
  }

  return <span className="text-gray-500">Bekleniyor...</span>;
};