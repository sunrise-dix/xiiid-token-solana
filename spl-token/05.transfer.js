import fs from "fs";

import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";

import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

const MINT = new PublicKey("6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC");

const RECEIVER = new PublicKey("6nzRfHcuPH3FSnigPj51uLyfTkfK45gR6SBt88kWmz3Q");

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("/Users/sunrise/.config/solana/id.json", "utf8")),
);

const wallet = Keypair.fromSecretKey(secret);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// 내 토큰 계정
const senderAta = await getOrCreateAssociatedTokenAccount(
  connection,
  wallet,
  MINT,
  wallet.publicKey,
);

// 상대방 토큰 계정
const receiverAta = await getOrCreateAssociatedTokenAccount(
  connection,
  wallet,
  MINT,
  RECEIVER,
);

const DECIMALS = 9n;
const AMOUNT = 1_000_000_000n; // 10억개

const sig = await transfer(
  connection,
  wallet,
  senderAta.address,
  receiverAta.address,
  wallet,
  AMOUNT * 10n ** DECIMALS,
);

console.log("Transfer Signature:");
console.log(sig);
