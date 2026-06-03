import fs from "fs";
import { Connection, Keypair } from "@solana/web3.js";
import { ICluster, SolanaStreamClient, getBN } from "@streamflow/stream";

const RPC_URL = "https://api.devnet.solana.com";

const MINT = "6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC";
const RECIPIENT = "EJVuW1jxTaydFMLhe2UgFbJhzPHBw28U7y51iduKG7n";

const KEYPAIR_PATH = "/Users/sunrise/.config/solana/id.json";

function loadKeypair(path: string) {
  const secret = JSON.parse(fs.readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function main() {
  const sender = loadKeypair(KEYPAIR_PATH);
  console.log("sender:", sender.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");

  const client = new SolanaStreamClient({
    connection,
    clusterUrl: RPC_URL,
    cluster: ICluster.Devnet,
  });

  const now = Math.floor(Date.now() / 1000);
  const unlockAt = now + 300; // 10분 lock

  const amount = getBN(250, 9);

  // 🔥 devnet-safe minimal config
  const createData = {
    recipient: RECIPIENT,
    tokenId: MINT,

    amount,
    start: unlockAt,
    cliff: unlockAt,
    cliffAmount: getBN(0, 9),
    period: 1,
    amountPerPeriod: amount,
    name: "test-lockup",
    canTopup: false,
    cancelableBySender: false,
    cancelableByRecipient: false,

    transferableBySender: false,
    transferableByRecipient: false,

    automaticWithdrawal: true,
  };

  console.log("createData:", createData);

  try {
    const result = await client.create(createData, {
      sender,
      isNative: false,
    });

    console.log("TX:", result.txId);
    console.log("STREAM:", result.metadataId);
  } catch (e) {
    console.error("FAILED:");
    console.dir(e, { depth: 10 });
  }
}

main();
