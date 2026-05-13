import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Zap, Shield, Brain, Cpu } from "lucide-react";
import { supportedChains } from "@/config/wallet";

const WalletGate = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  if (isConnected) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center glow-purple-strong">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight">RialAI</span>
          </div>
          <p className="text-sm text-white/40 font-mono tracking-widest uppercase">Powered by Rialo</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 glow-purple">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-xl font-display font-bold text-white mb-2">Connect to Access</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Connect your wallet to unlock the RialAI agent workspace. No crypto experience needed.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { icon: <Brain className="w-4 h-4" />, label: "6 AI Agents" },
              { icon: <Zap className="w-4 h-4" />, label: "Real Outputs" },
              { icon: <Cpu className="w-4 h-4" />, label: "Rialo Ready" },
            ].map((f) => (
              <div key={f.label} className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                <div className="text-purple-400 flex justify-center mb-1.5">{f.icon}</div>
                <p className="text-[11px] text-white/50 font-mono">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Chains */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {supportedChains.map((chain) => (
              <span key={chain.id} className="text-[10px] text-white/30 bg-white/4 px-2.5 py-1 rounded-full border border-white/6 font-mono">
                {chain.icon} {chain.name}
              </span>
            ))}
          </div>

          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full h-12 rounded-xl bg-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-purple-500 transition-all glow-purple-strong active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>

          <p className="text-center text-[11px] text-white/25 mt-4 font-mono">
            Wallet is optional for core features · Web3 unlocks Rialo identity
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletGate;
