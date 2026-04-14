import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WalletButton = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            onClick={openConnectModal}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 h-9 text-xs font-medium"
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <ConnectButton.Custom>
          {({ chain: chainData, openChainModal }) => (
            <button
              onClick={openChainModal}
              className="flex items-center gap-1.5 text-xs bg-secondary/60 hover:bg-secondary/80 px-3 py-1.5 rounded-full transition-colors text-foreground"
            >
              {chainData?.hasIcon && chainData.iconUrl && (
                <img
                  src={chainData.iconUrl}
                  alt={chainData.name ?? "Chain"}
                  className="w-4 h-4 rounded-full"
                />
              )}
              {chainData?.name ?? "Unknown"}
            </button>
          )}
        </ConnectButton.Custom>

        <div className="flex items-center gap-1.5 bg-secondary/60 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-foreground font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>

        <button
          onClick={() => disconnect()}
          className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletButton;
