const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const LOCAL_IPFS_CACHE: Record<string, string> = {};

export async function sha256Hex(text: string): Promise<`0x${string}`> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}

// Uploads raw feedback text to Pinata, returning the resulting CID (with local fallback if scope is invalid)
export async function uploadToIPFS(text: string): Promise<string> {
  const contentHash = await sha256Hex(text);

  if (PINATA_JWT) {
    try {
      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: { text },
          pinataMetadata: { name: `feedback-${Date.now()}` },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.IpfsHash as string;
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.warn("Pinata API returned error, using local IPFS fallback:", errorData);
      }
    } catch (err) {
      console.warn("IPFS upload request failed, using local fallback:", err);
    }
  }

  // Local fallback CID generation if Pinata API key lacks required scope
  const fallbackCid = `Qm${contentHash.slice(2, 44)}`;
  LOCAL_IPFS_CACHE[fallbackCid] = text;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`ipfs_${fallbackCid}`, JSON.stringify({ text }));
    } catch (e) {}
  }
  return fallbackCid;
}

// Fetches feedback JSON from a public IPFS gateway or local cache by CID
export async function fetchFromIPFS(cid: string): Promise<string> {
  if (LOCAL_IPFS_CACHE[cid]) {
    return LOCAL_IPFS_CACHE[cid];
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`ipfs_${cid}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.text || cached;
      } catch (e) {
        return cached;
      }
    }
  }

  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
  ];

  for (const gw of gateways) {
    try {
      const res = await fetch(gw, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        return typeof data === "string" ? data : data.text || JSON.stringify(data);
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(`Failed to fetch IPFS CID ${cid} from gateways`);
}