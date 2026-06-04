import fs from "fs";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

const tokenConfig = JSON.parse(
  fs.readFileSync(new URL("./config/token-config.json", import.meta.url), "utf8"),
);

const DECIMALS = BigInt(tokenConfig.decimals);
const SUPPLY = 10_000_000_000n; // 100억

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync(tokenConfig.keypairPath, "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl(tokenConfig.cluster), "confirmed");

const mint = new PublicKey(tokenConfig.mint);

const ata = await getOrCreateAssociatedTokenAccount(
  connection,
  wallet,
  mint,
  wallet.publicKey,
);

const signature = await mintTo(
  connection,
  wallet,
  mint,
  ata.address,
  wallet,
  SUPPLY * 10n ** DECIMALS,
);

console.log("Minted");
console.log("Signature:", signature);
console.log("ATA:", ata.address.toBase58());
