import fs from "fs";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

const MINT = "6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC";

const DECIMALS = 9n;
const SUPPLY = 10_000_000_000n; // 100억

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("/Users/sunrise/.config/solana/id.json", "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const mint = new PublicKey(MINT);

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
