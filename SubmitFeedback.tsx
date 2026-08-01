"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { uploadToIPFS, sha256Hex } from "@/lib/ipfs";

export function SubmitFeedback() {
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"idle" | "uploading" | "confirming" | "done" | "error">("idle");

    const { writeContract, data: hash } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    async function handleSubmit() {
        if (!text.trim()) return;
        try {
            setStatus("uploading");
            const cid = await uploadToIPFS(text);
            const contentHash = await sha256Hex(text);

            setStatus("confirming");
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "submitFeedback",
                args: [cid, contentHash],
            });
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    }

    if (isSuccess && status !== "done") setStatus("done");

    return (
        <div className="border border-gray-800 rounded-lg p-4 mb-6">
            <textarea
                className="w-full bg-gray-900 rounded p-3 text-sm"
                rows={4}
                placeholder="Share honest feedback anonymously..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={status === "uploading" || status === "confirming"}
            />
            <button
                onClick={handleSubmit}
                disabled={status === "uploading" || status === "confirming"}
                className="mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium"
            >
                {status === "uploading" && "Uploading to IPFS..."}
                {status === "confirming" && "Confirming on Ethereum..."}
                {(status === "idle" || status === "done") && "Submit Feedback"}
                {status === "error" && "Retry"}
            </button>
            {status === "done" && (
                <p className="text-green-400 text-xs mt-2">Submitted permanently — refresh feed below.</p>
            )}
            {status === "error" && (
                <p className="text-red-400 text-xs mt-2">Something failed — check console and try again.</p>
            )}
        </div>
    );
}