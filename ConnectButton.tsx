'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { Wallet, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  if (isConnected && address) {
    const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Chain ID: {chainId}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-2 text-sm text-gray-200 shadow-md">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="font-mono">{formattedAddress}</span>
          <button
            onClick={() => disconnect()}
            title="Disconnect Wallet"
            className="ml-2 text-gray-400 hover:text-red-400 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.slice(0, 1).map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={status === 'pending'}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          <span>{status === 'pending' ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      ))}
    </div>
  );
}
