import fs from "fs";

import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

import { createMint } from "@solana/spl-token";

const tokenConfig = JSON.parse(
  fs.readFileSync(new URL("./config/token-config.json", import.meta.url), "utf8"),
);

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync(tokenConfig.keypairPath, "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl(tokenConfig.cluster), "confirmed");

const mint = await createMint(
  connection,
  wallet,
  wallet.publicKey,
  wallet.publicKey,
  tokenConfig.decimals,
);

const mintAddress = mint.toBase58();

console.log("Mint Address:");
console.log(mintAddress);
