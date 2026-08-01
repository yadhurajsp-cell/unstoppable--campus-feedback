import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
    title: "Unstoppable Campus Feedback",
    description: "Censorship-resistant anonymous student feedback on Ethereum",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-950 text-gray-100 min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}