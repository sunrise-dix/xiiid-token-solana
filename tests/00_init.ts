import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { PublicKey, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import os from "os";
import path from "path";

describe("xiiid-token-solana", () => {
  if (!process.env.ANCHOR_PROVIDER_URL) {
    process.env.ANCHOR_PROVIDER_URL = clusterApiUrl("devnet");
  }
  if (!process.env.ANCHOR_WALLET) {
    process.env.ANCHOR_WALLET = path.join(
      os.homedir(),
      ".config/solana/id.json",
    );
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.XiiidTokenSolana as anchor.Program;

  it("initialize_config", async () => {
    const owner = provider.wallet.publicKey;
    const payer = (provider.wallet as anchor.Wallet).payer;

    const mint = await createMint(provider.connection, payer, owner, null, 9);

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );

    const cap = new BN("1000000000000");

    const sig = await program.methods
      .initializeConfig(cap)
      .accounts({
        config: configPda,
        mint,
        owner,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await (program.account as any).config.fetch(configPda);

    console.log("initialize_config tx:", sig);
    console.log("programId:", program.programId.toBase58());
    console.log("configPda:", configPda.toBase58());
    console.log("mint:", mint.toBase58());

    if (!config.owner.equals(owner)) {
      throw new Error("config.owner mismatch");
    }
    if (!config.mint.equals(mint)) {
      throw new Error("config.mint mismatch");
    }
    if (!config.cap.eq(cap)) {
      throw new Error("config.cap mismatch");
    }
  });
});
