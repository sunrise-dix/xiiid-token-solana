import fs from "fs";
import { Keypair } from "@solana/web3.js";
import { SolanaStreamClient, ICluster, getBN } from "@streamflow/stream";

const RPC_URL = "https://api.devnet.solana.com";

const STREAM_ID = "Ep2hGuN5MbmJfrngpMdMTXqYuJMgdP2srWmVUYxTxbxK";

const RECIPIENT_KEYPAIR =
  "/Users/sunrise/Desktop/workspace/web3/xiiid-token-solana/token/lockup-recipient.json";

function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(path, "utf8"));

  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function main() {
  const recipient = loadKeypair(RECIPIENT_KEYPAIR);

  console.log("recipient:", recipient.publicKey.toBase58());

  const client = new SolanaStreamClient(RPC_URL, ICluster.Devnet);

  const amount = getBN(100, 9);

  const result = await client.withdraw(
    {
      id: STREAM_ID,
      amount,
    },
    {
      invoker: recipient as unknown as Parameters<
        typeof client.withdraw
      >[1]["invoker"],
    },
  );

  console.log("Withdraw TX:");
  console.log(result.txId);
}

main().catch((e) => {
  console.error(e);

  if (e?.transactionLogs) {
    console.log("\n=== Program Logs ===");
    console.log(e.transactionLogs.join("\n"));
  }
});
