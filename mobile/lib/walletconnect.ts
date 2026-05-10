import SignClient from "@walletconnect/sign-client";
import { WALLETCONNECT_PROJECT_ID } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

let signClient: SignClient | null = null;

export const getSignClient = async () => {
  if (signClient) return signClient;

  // @ts-ignore - AsyncStorage integration for Expo Go compatibility
  signClient = await SignClient.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: "WorkSeal",
      description: "Freelance Contract Platform on Sui Blockchain",
      url: "https://workseal.app",
      icons: ["https://workseal.app/logo.png"],
      redirect: {
        native: "workseal://",
      },
    },
  });

  return signClient;
};

export const clearSignClient = () => {
  signClient = null;
};
