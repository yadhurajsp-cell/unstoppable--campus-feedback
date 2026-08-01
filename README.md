
# Unstoppable Campus Feedback

**Track: C — Censorship Resistance**

Anonymous student feedback that no one — not administrators, not even the project's own creator — can delete, edit, or suppress. Feedback content lives on IPFS; a permanent, immutable proof of every submission lives on Ethereum.

---

## The Problem

Students often avoid giving honest feedback about professors, policies, or campus issues because they fear it will be quietly deleted or that criticism will be traced back to them. A traditional feedback system — Google Forms, a school database, Firebase — is only as trustworthy as the administrator who controls it. Even with good intentions, that person or institution retains the technical ability to remove anything they don't like.

## The Solution

Students submit feedback anonymously through a wallet-connected web app. Under the hood:

1. Feedback text is uploaded to **IPFS** (a distributed storage network, not a single company's server).
2. The resulting **CID** (content identifier) and a **SHA-256 hash** of the text are permanently recorded on the **Ethereum Sepolia** blockchain.
3. The smart contract has **no owner, no admin role, and no delete function** — not restricted, entirely absent from the code.

Anyone can browse the feed. Anyone can independently verify, straight from Etherscan, that every entry is real and unmodified.

## Why Blockchain — Not Firebase or SQL

This is the core question the project is built to answer.

| | Traditional Database | This Project |
|---|---|---|
| Who can delete an entry? | The admin/owner, always | No one — the function doesn't exist |
| Guarantee against censorship | A policy or promise | Enforced by every node on Ethereum |
| Can content be silently altered? | Yes, by anyone with DB access | No — CID + hash change if content changes |
| Verifiable by a third party? | Trust the operator | Anyone can check on Etherscan directly |

A database's integrity depends on trusting whoever runs it. This project's integrity is a property of the system itself — the same reason it's a genuine fit for the Censorship Resistance track rather than a blockchain wrapper around an otherwise ordinary app.

## Integrity Verification (Hash Check)

An IPFS CID is already a content-derived address, but re-verifying it client-side means reimplementing IPFS's multihash encoding. Instead, this project stores a separate **SHA-256 hash** on-chain alongside the CID. When feedback is displayed:

1. The app fetches the content from IPFS by CID.
2. It recomputes the SHA-256 hash of what it fetched, using the browser's native `crypto.subtle.digest`.
3. It compares that hash to the immutable value stored on Ethereum.
4. A **✓ Verified on-chain** or **⚠ Hash mismatch** badge is shown accordingly.

Even if an IPFS gateway served altered or corrupted content, the mismatch would be caught and flagged instantly — without relying on IPFS's own guarantees.

## Tech Stack

**Frontend:** Next.js, React, TypeScript, TailwindCSS, RainbowKit, wagmi, viem
**Blockchain:** Solidity, Hardhat
**Storage:** IPFS via Pinata
**Wallet:** MetaMask
**Network:** Ethereum Sepolia (testnet)

## Architecture

```
Student → writes feedback text
        → uploaded to IPFS via Pinata → returns CID
        → text hashed locally (SHA-256)
        → CID + hash sent to smart contract (submitFeedback)
        → contract emits event, stores entry permanently
        → frontend reads all entries from contract
        → fetches each entry's content from IPFS
        → recomputes hash, compares to on-chain value
        → renders feed with verification status
```

## Smart Contract

Deployed and verified on Sepolia:

```
0x26b8B3A0a1Edfbb8EFCCF67e857ff290B8C8eFa7
```

View on Etherscan: `https://sepolia.etherscan.io/address/0x26b8B3A0a1Edfbb8EFCCF67e857ff290B8C8eFa7`

Key design decisions:
- **No `Ownable`, no admin address, no access control of any kind.** The absence of these is the actual feature this track is judged on.
- **CID + hash stored, not the raw text.** Keeps on-chain storage costs minimal while preserving a verifiable, permanent link to the content.
- **`getAllFeedback()` returns the full array.** Simplest possible read path for a small hackathon-scale dataset.

```solidity
function submitFeedback(string calldata cid, bytes32 contentHash) external {
    require(bytes(cid).length > 0, "CID cannot be empty");
    require(contentHash != bytes32(0), "Hash cannot be empty");

    feedbackList.push(Feedback({
        cid: cid,
        contentHash: contentHash,
        timestamp: block.timestamp
    }));

    emit FeedbackSubmitted(feedbackList.length - 1, cid, contentHash, block.timestamp);
}
```

Full source: [`contracts/contracts/CampusFeedback.sol`](contracts/contracts/CampusFeedback.sol)

## Project Structure

```
campus-feedback/
├── contracts/
│   ├── contracts/CampusFeedback.sol
│   ├── test/CampusFeedback.test.ts
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
│       ├── contract.ts
│       └── ipfs.ts
└── README.md
```

## Running Locally

### Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

To deploy your own instance to Sepolia:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
```

Requires a `.env` file with `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `ETHERSCAN_API_KEY`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`, connect a MetaMask wallet on Sepolia, and submit feedback.

Requires a `.env.local` file with:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x26b8B3A0a1Edfbb8EFCCF67e857ff290B8C8eFa7
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## Known Limitations

- **IPFS pinning is currently via a single provider (Pinata).** If Pinata stopped pinning the content and no one else re-pinned it, the CID and hash would still exist permanently on-chain as proof of submission, but the content itself could become temporarily unreachable. Anyone can re-pin the same content to a new IPFS node using the same CID, since IPFS addressing is based on content, not host.
- **Wallet addresses are public on-chain.** "Anonymous" means no name or student ID is ever collected — not that the submitting address is hidden. Students can use a fresh wallet for full separation from their identity.
- **No moderation, by design.** There is no way to remove spam or bad-faith entries. This is the direct tradeoff of true immutability, not an oversight.

## License

MIT
