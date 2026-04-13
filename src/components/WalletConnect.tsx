import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletState {
  address: string;
  chain: "evm" | "solana";
  label: string;
}

interface WalletConnectProps {
  onConnect: (wallet: WalletState) => void;
  onDisconnect: () => void;
  connected: WalletState | null;
}

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const WalletConnect = ({ onConnect, onDisconnect, connected }: WalletConnectProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const connectMetaMask = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting("metamask");
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        onConnect({ address: accounts[0], chain: "evm", label: "MetaMask" });
      }
    } catch (e) {
      console.error("MetaMask connection failed", e);
    } finally {
      setConnecting(null);
      setShowMenu(false);
    }
  }, [onConnect]);

  const connectPhantom = useCallback(async () => {
    const phantom = (window as any).solana;
    if (!phantom?.isPhantom) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    setConnecting("phantom");
    try {
      const resp = await phantom.connect();
      if (resp?.publicKey) {
        onConnect({ address: resp.publicKey.toString(), chain: "solana", label: "Phantom" });
      }
    } catch (e) {
      console.error("Phantom connection failed", e);
    } finally {
      setConnecting(null);
      setShowMenu(false);
    }
  }, [onConnect]);

  const handleDisconnect = useCallback(async () => {
    if (connected?.chain === "solana") {
      try { await (window as any).solana?.disconnect(); } catch {}
    }
    onDisconnect();
    setShowMenu(false);
  }, [connected, onDisconnect]);

  const copyAddress = useCallback(() => {
    if (!connected) return;
    navigator.clipboard.writeText(connected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [connected]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    const timer = setTimeout(() => document.addEventListener("click", close), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", close);
    };
  }, [showMenu]);

  if (connected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm"
        >
          <div className={`w-2 h-2 rounded-full ${connected.chain === "evm" ? "bg-blue-500" : "bg-purple-500"}`} />
          <span className="text-foreground font-medium">{truncateAddress(connected.address)}</span>
          <span className="text-[10px] text-muted-foreground">{connected.label}</span>
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 glass-card-solid rounded-xl p-2 z-50 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-border/50 mb-1">
                <p className="text-xs text-muted-foreground">Connected via {connected.label}</p>
                <p className="text-xs font-mono text-foreground mt-0.5">{truncateAddress(connected.address)}</p>
              </div>
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-sm text-foreground"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Address"}
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        size="sm"
        className="gap-2 rounded-full"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 glass-card-solid rounded-xl p-3 z-50 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-muted-foreground mb-3 px-1">Select a wallet to connect</p>

            <button
              onClick={connectMetaMask}
              disabled={!!connecting}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/50 mb-1.5"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg">🦊</div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">MetaMask</p>
                <p className="text-[11px] text-muted-foreground">Ethereum & EVM chains</p>
              </div>
              {connecting === "metamask" && <div className="spinner ml-auto !w-4 !h-4 !border-primary/30 !border-t-primary" />}
            </button>

            <button
              onClick={connectPhantom}
              disabled={!!connecting}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg">👻</div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Phantom</p>
                <p className="text-[11px] text-muted-foreground">Solana</p>
              </div>
              {connecting === "phantom" && <div className="spinner ml-auto !w-4 !h-4 !border-primary/30 !border-t-primary" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnect;
