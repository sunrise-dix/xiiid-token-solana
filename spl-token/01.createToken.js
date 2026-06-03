import fs from "fs";

import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

import { createMint } from "@solana/spl-token";

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("/Users/sunrise/.config/solana/id.json", "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const mint = await createMint(
  connection,
  wallet,
  wallet.publicKey,
  wallet.publicKey,
  9,
);

console.log("Mint Address:");
console.log(mint.toBase58());
