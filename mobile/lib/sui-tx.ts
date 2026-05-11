import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { PACKAGE_ID, CLOCK_OBJECT_ID, SUI_NETWORK } from "../constants/config";
import { CreateContractInput } from "../types";

const suiClientForBuild = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

export const buildCreateContractTx = async (
  params: CreateContractInput & { senderAddress: string }
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::workseal::create_contract`,
    arguments: [
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      tx.pure.address(params.client),
      tx.pure.u64(params.deadline_ms),
      tx.pure.vector("string", params.milestone_titles),
      tx.pure.vector("u64", params.milestone_amounts),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  tx.setSender(params.senderAddress);
  const bytes = await tx.build({ client: suiClientForBuild });
  return Buffer.from(bytes).toString("base64");
};

export const buildFundContractTx = async (
  contractId: string,
  amount: bigint,
  senderAddress: string
) => {
  const tx = new Transaction();
  
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::workseal::fund_contract`,
    arguments: [tx.object(contractId), coin],
  });

  tx.setSender(senderAddress);
  const bytes = await tx.build({ client: suiClientForBuild });
  return Buffer.from(bytes).toString("base64");
};

export const buildSubmitMilestoneTx = async (
  contractId: string,
  milestoneIndex: number,
  senderAddress: string
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::workseal::submit_milestone`,
    arguments: [tx.object(contractId), tx.pure.u64(milestoneIndex)],
  });

  tx.setSender(senderAddress);
  const bytes = await tx.build({ client: suiClientForBuild });
  return Buffer.from(bytes).toString("base64");
};

export const buildApproveAndReleaseTx = async (
  contractId: string,
  milestoneIndex: number,
  senderAddress: string
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::workseal::approve_and_release_funds`,
    arguments: [tx.object(contractId), tx.pure.u64(milestoneIndex)],
  });

  tx.setSender(senderAddress);
  const bytes = await tx.build({ client: suiClientForBuild });
  return Buffer.from(bytes).toString("base64");
};

export const buildRaiseDisputeTx = async (
  contractId: string,
  reason: string,
  senderAddress: string
) => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::workseal::raise_dispute`,
    arguments: [
      tx.object(contractId),
      tx.pure.string(reason),
      tx.object(CLOCK_OBJECT_ID),
    ],
  });

  tx.setSender(senderAddress);
  const bytes = await tx.build({ client: suiClientForBuild });
  return Buffer.from(bytes).toString("base64");
};
