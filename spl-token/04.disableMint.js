import fs from "fs";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { setAuthority, AuthorityType } from "@solana/spl-token";

const tokenConfig = JSON.parse(
  fs.readFileSync(new URL("./config/token-config.json", import.meta.url), "utf8"),
);

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync(tokenConfig.keypairPath, "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl(tokenConfig.cluster), "confirmed");

await setAuthority(
  connection,
  wallet,
  new PublicKey(tokenConfig.mint),
  wallet.publicKey,
  AuthorityType.MintTokens,
  null,
);

console.log("Mint Authority Disabled");
