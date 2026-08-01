"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SubmitFeedback } from "@/components/SubmitFeedback";
import { FeedbackList } from "@/components/FeedbackList";

export default function Home() {
    return (
        <main className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold">Unstoppable Campus Feedback</h1>
                <ConnectButton />
            </div>
            <SubmitFeedback />
            <FeedbackList />
        </main>
    );
}