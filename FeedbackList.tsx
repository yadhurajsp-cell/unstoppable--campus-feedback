"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { fetchFromIPFS, sha256Hex } from "@/lib/ipfs";

type VerifiedFeedback = {
    cid: string;
    text: string;
    timestamp: number;
    verified: boolean;
};

export function FeedbackList() {
    const [items, setItems] = useState<VerifiedFeedback[]>([]);
    const [loading, setLoading] = useState(true);

    const { data: onchain } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getAllFeedback",
    });

    useEffect(() => {
        if (!onchain) return;

        async function verifyAll() {
            const results: VerifiedFeedback[] = [];
            for (const entry of onchain as any[]) {
                try {
                    const text = await fetchFromIPFS(entry.cid);
                    const recomputedHash = await sha256Hex(text);
                    results.push({
                        cid: entry.cid,
                        text,
                        timestamp: Number(entry.timestamp),
                        verified: recomputedHash === entry.contentHash,
                    });
                } catch {
                    results.push({ cid: entry.cid, text: "[Failed to load from IPFS]", timestamp: Number(entry.timestamp), verified: false });
                }
            }
            setItems(results.reverse()); // newest first
            setLoading(false);
        }

        verifyAll();
    }, [onchain]);

    if (loading) return <p className="text-gray-500 text-sm">Loading feedback...</p>;
    if (items.length === 0) return <p className="text-gray-500 text-sm">No feedback yet — be the first.</p>;

    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="border border-gray-800 rounded-lg p-4">
                    <p className="text-sm">{item.text}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-500">{new Date(item.timestamp * 1000).toLocaleString()}</span>
                        {item.verified ? (
                            <span className="text-green-400">✓ Verified on-chain</span>
                        ) : (
                            <span className="text-red-400">⚠ Hash mismatch — tampered content</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}