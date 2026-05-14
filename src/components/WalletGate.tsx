import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Zap, Network, Layers } from "lucide-react";
import { supportedChains } from "@/config/wallet";

const WalletGate = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAccount();
  if (isConnected) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(130,88,109,0.08)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-[80px]" style={{ background: 'rgba(209,204,191,0.04)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center rose-glow-strong" style={{ background: '#82586d' }}>
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-display font-bold tracking-tight" style={{ color: '#e8e2d5' }}>NEXUS</p>
              <p className="text-xs font-mono" style={{ color: '#82586d' }}>× Rialo</p>
            </div>
          </div>
          <p className="text-sm font-mono" style={{ color: 'rgba(209,204,191,0.3)', letterSpacing: '0.15em' }}>AI AGENT ECONOMY</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 relative overflow-hidden noise" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(130,88,109,0.12)', border: '1px solid rgba(130,88,109,0.2)' }}>
              <Layers className="w-7 h-7" style={{ color: '#82586d' }} />
            </div>
            <h2 className="text-xl font-display font-bold text-center mb-2" style={{ color: '#e8e2d5' }}>Connect to Access</h2>
            <p className="text-sm text-center leading-relaxed mb-7" style={{ color: 'rgba(209,204,191,0.45)' }}>
              Connect your wallet to enter the NEXUS agent economy. No crypto expertise required.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-7">
              {[
                { icon: <Network className="w-3.5 h-3.5" />, label: "6 Agents" },
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Real Outputs" },
                { icon: <Layers className="w-3.5 h-3.5" />, label: "Rialo Ready" },
              ].map(f => (
                <div key={f.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-center mb-1" style={{ color: '#82586d' }}>{f.icon}</div>
                  <p className="text-[10px] font-mono" style={{ color: 'rgba(209,204,191,0.4)' }}>{f.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center mb-7">
              {supportedChains.map(c => (
                <span key={c.id} className="text-[10px] font-mono px-2.5 py-1 rounded-full" style={{ color: 'rgba(209,204,191,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {c.icon} {c.name}
                </span>
              ))}
            </div>

            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full h-12 rounded-2xl font-semibold text-sm transition-all rose-glow-strong hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#82586d', color: '#f5f0e8' }}
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
            <p className="text-center text-[11px] font-mono mt-4" style={{ color: 'rgba(209,204,191,0.2)' }}>
              Web2 friendly · Wallet optional for core features
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletGate;
