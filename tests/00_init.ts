import "dotenv/config";
import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";

describe("xiiid-token-solana", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.XiiidTokenSolana as anchor.Program;

  const MINT = new PublicKey("5Cb6V6EJyvEbfGBXZ9MmUqiNS3KrVnjudnBBL3KJLqu2");

  it("initialize_config", async () => {
    const owner = provider.wallet.publicKey;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    const cap = new BN("1000000000000");

    const sig = await program.methods
      .initializeConfig(cap)
      .accounts({
        config: configPda,
        mint: MINT,
        owner,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("initialize_config tx:", sig);
    console.log("programId:", program.programId.toBase58());
    console.log("configPda:", configPda.toBase58());
  });
});
