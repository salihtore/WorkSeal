import { useState } from "react";
import { useWalletConnect } from "./use-wallet-connect";
import { useWalletStore } from "./use-wallet-store";
import * as txBuilder from "../lib/sui-tx";
import { CreateContractInput } from "../types";
import { useQueryClient } from "@tanstack/react-query";

export const useTransaction = () => {
  const { signAndExecute, isPending: isSigning } = useWalletConnect();
  const { address } = useWalletStore();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeTx = async (txBase64: string) => {
    setError(null);
    setIsPending(true);
    try {
      const digest = await signAndExecute(txBase64);
      setTxDigest(digest);
      await queryClient.invalidateQueries({ queryKey: ["contracts"] });
      return digest;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const createContract = async (input: CreateContractInput) => {
    if (!address) throw new Error("Wallet not connected");
    const tx = await txBuilder.buildCreateContractTx({ ...input, senderAddress: address });
    return await executeTx(tx);
  };

  const fundContract = async (contractId: string, amount: bigint) => {
    if (!address) throw new Error("Wallet not connected");
    const tx = await txBuilder.buildFundContractTx(contractId, amount, address);
    return await executeTx(tx);
  };

  const submitMilestone = async (contractId: string, index: number) => {
    if (!address) throw new Error("Wallet not connected");
    const tx = await txBuilder.buildSubmitMilestoneTx(contractId, index, address);
    return await executeTx(tx);
  };

  const approveAndRelease = async (contractId: string, index: number) => {
    if (!address) throw new Error("Wallet not connected");
    const tx = await txBuilder.buildApproveAndReleaseTx(contractId, index, address);
    return await executeTx(tx);
  };

  const raiseDispute = async (contractId: string, reason: string) => {
    if (!address) throw new Error("Wallet not connected");
    const tx = await txBuilder.buildRaiseDisputeTx(contractId, reason, address);
    return await executeTx(tx);
  };

  return {
    createContract,
    fundContract,
    submitMilestone,
    approveAndRelease,
    raiseDispute,
    isPending: isPending || isSigning,
    error,
    txDigest,
  };
};
