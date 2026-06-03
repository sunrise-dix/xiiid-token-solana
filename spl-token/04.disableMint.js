import fs from "fs";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { setAuthority, AuthorityType } from "@solana/spl-token";

const MINT = "6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC";

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("/Users/sunrise/.config/solana/id.json", "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

await setAuthority(
  connection,
  wallet,
  new PublicKey(MINT),
  wallet.publicKey,
  AuthorityType.MintTokens,
  null,
);

console.log("Mint Authority Disabled");
