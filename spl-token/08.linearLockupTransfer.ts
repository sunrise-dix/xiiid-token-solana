import fs from "fs";
import { Connection, Keypair } from "@solana/web3.js";
import { ICluster, SolanaStreamClient, getBN } from "@streamflow/stream";

const RPC_URL = "https://api.devnet.solana.com";

const MINT = "6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC";
const RECIPIENT = "E4bgTkgGzHgRaY7no6JobvsAHdbWYjYRBiqu1WsdjFfA";

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
  const startAt = now + 60; // 1분 뒤 시작

  const cliffAt = now + 5 * 60; // 5분 후

  const createData = {
    recipient: RECIPIENT,
    tokenId: MINT,
    // 총 100개
    amount: getBN(100, 9),
    // 베스팅 시작 시점
    start: startAt,
    // 5분 클리프
    cliff: cliffAt,
    // 클리프 시 즉시 지급 없음
    cliffAmount: getBN(0, 9),
    // 60초마다
    period: 60,
    // 출금 가능 주기
    withdrawalFrequency: 60,
    // 매 period마다 10개
    amountPerPeriod: getBN(10, 9),
    name: "test-lockup",
    canTopup: false,
    cancelableBySender: false,
    cancelableByRecipient: false,
    transferableBySender: false,
    transferableByRecipient: false,
    automaticWithdrawal: true,
  };

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
