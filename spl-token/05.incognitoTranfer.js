import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const MINT = new PublicKey("6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC");

// A (보내는 사람)
const A = new PublicKey("6nzRfHcuPH3FSnigPj51uLyfTkfK45gR6SBt88kWmz3Q");

// B (받는 사람)
const B = new PublicKey("ARtX6Ry4YPZWEQsq7yiGdyTb812DGqhWHikHECRy8FSz");

const senderAta = await getAssociatedTokenAddress(MINT, A);

const receiverAta = await getAssociatedTokenAddress(MINT, B);

const amount = 100n * 10n ** 9n; // 100 XIIID

const tx = new Transaction().add(
  createTransferInstruction(
    senderAta,
    receiverAta,
    A, // authority
    amount,
  ),
);

const { blockhash } = await connection.getLatestBlockhash();

tx.recentBlockhash = blockhash;
tx.feePayer = A;

console.log(
  tx
    .serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString("base64"),
);
