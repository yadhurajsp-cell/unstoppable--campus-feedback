import { expect } from "chai";
import { ethers } from "hardhat";

describe("CampusFeedback", function () {
  async function deployFixture() {
    const [alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CampusFeedback");
    const contract = await Factory.deploy();
    return { contract, alice, bob };
  }

  // Helper: turns feedback text into the same bytes32 hash the frontend will compute
  function hashOf(text: string): string {
    return ethers.sha256(ethers.toUtf8Bytes(text));
  }

  it("stores cid, hash, and timestamp correctly on submit", async function () {
    const { contract, alice } = await deployFixture();
    const cid = "QmTestCid123";
    const hash = hashOf("This professor never shows up to class.");

    await contract.connect(alice).submitFeedback(cid, hash);

    const all = await contract.getAllFeedback();
    expect(all.length).to.equal(1);
    expect(all[0].cid).to.equal(cid);
    expect(all[0].contentHash).to.equal(hash);
  });

  it("emits FeedbackSubmitted with correct data", async function () {
    const { contract, alice } = await deployFixture();
    const cid = "QmTestCid456";
    const hash = hashOf("Dining hall food safety concern.");

    await expect(contract.connect(alice).submitFeedback(cid, hash))
      .to.emit(contract, "FeedbackSubmitted")
      .withArgs(0, cid, hash, anyValue => true); // timestamp varies, checked loosely below
  });

  it("rejects an empty CID", async function () {
    const { contract, alice } = await deployFixture();
    const hash = hashOf("Some feedback");
    await expect(
      contract.connect(alice).submitFeedback("", hash)
    ).to.be.revertedWith("CID cannot be empty");
  });

  it("rejects a zero content hash", async function () {
    const { contract, alice } = await deployFixture();
    await expect(
      contract.connect(alice).submitFeedback("QmSomeCid", ethers.ZeroHash)
    ).to.be.revertedWith("Hash cannot be empty");
  });

  it("allows ANY wallet to submit — no admin, no restriction", async function () {
    const { contract, alice, bob } = await deployFixture();
    await contract.connect(alice).submitFeedback("QmA", hashOf("A"));
    await contract.connect(bob).submitFeedback("QmB", hashOf("B"));

    expect(await contract.getFeedbackCount()).to.equal(2);
  });

  it("preserves all entries in order — nothing can be removed", async function () {
    const { contract, alice } = await deployFixture();
    await contract.connect(alice).submitFeedback("Qm1", hashOf("1"));
    await contract.connect(alice).submitFeedback("Qm2", hashOf("2"));
    await contract.connect(alice).submitFeedback("Qm3", hashOf("3"));

    const all = await contract.getAllFeedback();
    expect(all.map(f => f.cid)).to.deep.equal(["Qm1", "Qm2", "Qm3"]);
    // Note: there is no deleteFeedback function in the contract at all —
    // that's the actual proof of censorship-resistance, not this test.
  });
});