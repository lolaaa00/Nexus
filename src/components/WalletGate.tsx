import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Play, Wallet, Zap } from "lucide-react";
import { supportedChains } from "@/config/wallet";

interface WalletGateProps {
  children: React.ReactNode;
}

const WalletGate = ({ children }: WalletGateProps) => {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-sm w-full text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground tracking-tight">
            ExecAI
          </span>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-7 h-7 text-primary" />
          </div>

          <h1 className="text-lg font-display font-bold text-foreground mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Connect a wallet to access your AI execution workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {supportedChains.map((chain) => (
              <span
                key={chain.id}
                className="text-[11px] text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-full"
              >
                {chain.icon} {chain.name}
              </span>
            ))}
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletGate;
