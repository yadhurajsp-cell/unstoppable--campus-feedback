import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
    appName: "Unstoppable Campus Feedback",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "044651f5960f1450dcb23120725021e5",
    chains: [sepolia],
    ssr: true,
});