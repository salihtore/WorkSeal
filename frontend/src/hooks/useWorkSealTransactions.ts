import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { WORKSEAL_PACKAGE_ID, WORKSEAL_MODULE, CLOCK_OBJECT_ID, ARBITRATOR_REGISTRY_ID } from '@/config/constants';
import { 
  ApproveAndReleaseFundsInput,
  CancelContractInput,
  CreateContractInput,
  FundContractInput,
  ProposeArbitratorInput,
  RaiseDisputeInput,
  RejectMilestoneInput,
  ResolveDisputeInput,
  ResumeContractInput,
  SendMessageInput,
  SendPrivateMessageInput,
  SubmitMilestoneInput
} from '@/types';

export const useWorkSealTransactions = () => {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const createContract = async (input: CreateContractInput) => {
    const tx = new Transaction();
    
    // bigint dizisini sui'nin beklediği string dizisine çeviriyoruz
    const amountsAsString = input.milestone_amounts.map(amount => amount.toString());

    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::create_contract`,
      arguments: [
        tx.pure.string(input.title),
        tx.pure.string(input.description),
        tx.pure.address(input.client),
        tx.pure.u64(input.deadline_ms),
        tx.pure.vector('string', input.milestone_titles),
        tx.pure.vector('u64', amountsAsString),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const fundContract = async (input: FundContractInput) => {
    const tx = new Transaction();
    
    // Kullanıcının cüzdanından (gas coin'inden) MIST cinsinden belirtilen miktarı ayırıyoruz
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(input.amount.toString())]);

    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::fund_contract`,
      arguments: [
        tx.object(input.contract_id),
        paymentCoin
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const submitMilestone = async (input: SubmitMilestoneInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::submit_milestone`,
      arguments: [
        tx.object(input.contract_id),
        tx.pure.u64(input.milestone_index),
        tx.pure.string(input.proof_link),
        tx.pure.string(input.proof_notes),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const approveAndReleaseFunds = async (input: ApproveAndReleaseFundsInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::approve_and_release_funds`,
      arguments: [
        tx.object(input.contract_id),
        tx.pure.u64(input.milestone_index),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const raiseDispute = async (input: RaiseDisputeInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::raise_dispute`,
      arguments: [
        tx.object(input.contract_id),
        tx.object(ARBITRATOR_REGISTRY_ID), // Registry eklendi
        tx.pure.string(input.reason),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const rejectMilestone = async (input: RejectMilestoneInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::reject_milestone`,
      arguments: [
        tx.object(input.contract_id),
        tx.pure.u64(input.milestone_index),
        tx.pure.string(input.reason),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const cancelContract = async (input: CancelContractInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::cancel_contract`,
      arguments: [
        tx.object(input.contract_id),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const takeJob = async (contractId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::take_job`,
      arguments: [
        tx.object(contractId),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const sendMessage = async (input: SendMessageInput) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::send_message`,
      arguments: [
        tx.object(input.contract_id),
        tx.pure.string(input.content),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    return await signAndExecuteTransaction({ transaction: tx });
  };


  const resolveDispute = async (input: ResolveDisputeInput) => {
    const tx = new Transaction();
    
    if (input.admin_cap_id) {
      // Admin çözüyorsa
      tx.moveCall({
        target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resolve_dispute_admin`,
        arguments: [
          tx.object(input.admin_cap_id),
          tx.object(ARBITRATOR_REGISTRY_ID),
          tx.object(input.contract_id),
          tx.pure.address(input.winner),
        ],
      });
    } else {
      // Atanan hakem çözüyorsa
      tx.moveCall({
        target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resolve_dispute_arbitrator`,
        arguments: [
          tx.object(ARBITRATOR_REGISTRY_ID),
          tx.object(input.contract_id),
          tx.pure.address(input.winner),
        ],
      });
    }

    return await signAndExecuteTransaction({ transaction: tx });
  };

  const resumeContractArbitrator = async (input: ResumeContractInput) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::resume_contract_arbitrator`,
      arguments: [
        txb.object(input.contract_id),
      ],
    });
    return signAndExecuteTransaction({ transaction: txb });
  };

  const sendPrivateMessage = async (input: SendPrivateMessageInput) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::send_private_message`,
      arguments: [
        txb.object(input.contract_id),
        txb.pure.string(input.content),
        txb.pure.u8(input.target_role),
        txb.object(CLOCK_OBJECT_ID),
      ],
    });
    return signAndExecuteTransaction({ transaction: txb });
  };

  const registerArbitrator = async (input: { arbitrator_address: string, max_jobs: number }) => {
    // AdminCap objesini bulmamız gerekiyor
    const adminCap = await client.getOwnedObjects({
      owner: account!.address,
      filter: { StructType: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::AdminCap` }
    });

    if (adminCap.data.length === 0) {
      throw new Error("Bu işlemi sadece AdminCap sahibi (Deployer) yapabilir.");
    }

    const adminCapId = adminCap.data[0].data!.objectId;

    const txb = new Transaction();
    txb.moveCall({
      target: `${WORKSEAL_PACKAGE_ID}::${WORKSEAL_MODULE}::register_arbitrator`,
      arguments: [
        txb.object(adminCapId),
        txb.object(ARBITRATOR_REGISTRY_ID),
        txb.pure.address(input.arbitrator_address),
        txb.pure.u64(input.max_jobs),
      ],
    });

    return signAndExecuteTransaction({
      transaction: txb,
    });
  };

  return {
    createContract,
    fundContract,
    submitMilestone,
    approveAndReleaseFunds,
    raiseDispute,
    rejectMilestone,
    cancelContract,
    takeJob,
    sendMessage,
    sendPrivateMessage,
    resumeContractArbitrator,
    resolveDispute,
    registerArbitrator
  };
};