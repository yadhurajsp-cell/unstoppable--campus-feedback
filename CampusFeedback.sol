// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Campus Feedback — censorship-resistant anonymous feedback board
/// @notice Feedback content lives on IPFS; CID + content hash are stored on-chain.
/// @dev No owner, no admin, no delete/edit function. Intentional.
contract CampusFeedback {
    struct Feedback {
        string cid;
        bytes32 contentHash; // SHA-256 hash of the raw feedback text
        uint256 timestamp;
    }

    Feedback[] private feedbackList;

    event FeedbackSubmitted(uint256 indexed id, string cid, bytes32 contentHash, uint256 timestamp);

    /// @notice Submit new feedback: its IPFS CID plus a SHA-256 hash of the content
    /// @param cid IPFS content identifier returned by Pinata after upload
    /// @param contentHash SHA-256 hash of the exact text uploaded to IPFS
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

    function getFeedbackCount() external view returns (uint256) {
        return feedbackList.length;
    }

    function getAllFeedback() external view returns (Feedback[] memory) {
        return feedbackList;
    }
}
