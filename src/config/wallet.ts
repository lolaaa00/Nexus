import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, optimism, base, bsc } from "wagmi/chains";

export const walletConfig = getDefaultConfig({
  appName: "ExecAI",
  projectId: "demo00000000000000000000000000000", // Replace with real WalletConnect Cloud project ID
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc],
});

export const supportedChains = [
  { id: mainnet.id, name: "Ethereum", icon: "⟠" },
  { id: polygon.id, name: "Polygon", icon: "⬡" },
  { id: arbitrum.id, name: "Arbitrum", icon: "🔵" },
  { id: optimism.id, name: "Optimism", icon: "🔴" },
  { id: base.id, name: "Base", icon: "🔷" },
  { id: bsc.id, name: "BNB Chain", icon: "🟡" },
];
