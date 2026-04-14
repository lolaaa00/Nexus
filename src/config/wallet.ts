import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, optimism, base, bsc } from "wagmi/chains";

export const walletConfig = getDefaultConfig({
  appName: "ExecAI",
  projectId: "b1e9e3d58a tried2b4a4e8f6c1a2b3c4d5", // Public demo WalletConnect ID
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc],
});
