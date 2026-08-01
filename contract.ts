export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

export const CAMPUS_FEEDBACK_ADDRESS = CONTRACT_ADDRESS;

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "cid", type: "string" },
      { indexed: false, internalType: "bytes32", name: "contentHash", type: "bytes32" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "FeedbackSubmitted",
    type: "event"
  },
  {
    inputs: [],
    name: "getAllFeedback",
    outputs: [
      {
        components: [
          { internalType: "string", name: "cid", type: "string" },
          { internalType: "bytes32", name: "contentHash", type: "bytes32" },
          { internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        internalType: "struct CampusFeedback.Feedback[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getFeedbackCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "cid", type: "string" },
      { internalType: "bytes32", name: "contentHash", type: "bytes32" }
    ],
    name: "submitFeedback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const CAMPUS_FEEDBACK_ABI = CONTRACT_ABI;
