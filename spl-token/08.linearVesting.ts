import fs from "fs";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { ICluster, SolanaStreamClient, getBN } from "@streamflow/stream";

const tokenConfig = JSON.parse(
  fs.readFileSync("config/token-config.json", "utf8"),
);
const RPC_URL = clusterApiUrl(tokenConfig.cluster);
const STREAMFLOW_CLUSTERS = {
  "mainnet-beta": ICluster.Mainnet,
  devnet: ICluster.Devnet,
};

type VestingInput = {
  category: string;
  recipient: string;
  quantity: number;
  tgeRatio: number;
  lockUpMonths: number;
  vestingMonths: number;
};

// 마지막 테스트 주소
// const vestingInputs: VestingInput[] = [
//   {
//     category: "ECOSystem",
//     recipient: "7xZkASZnv6efnsPHqKt6G8UEf1Xo513bSDheY1ipEuwd",
//     quantity: 5_000_000_000,
//     tgeRatio: 5,
//     lockUpMonths: 0,
//     vestingMonths: 48,
//   },
//   {
//     category: "Marketing",
//     recipient: "6VDeUL8ctMN5aaQpryAuyV6nL5f5idvgGPU9LsfCCg4v",
//     quantity: 1_000_000_000,
//     tgeRatio: 15,
//     lockUpMonths: 0,
//     vestingMonths: 36,
//   },
//   {
//     category: "Team",
//     recipient: "4kAqCDj29HKkxArCqSz4atnpQHgDNTjVQRcmKpV4wY8d",
//     quantity: 1_500_000_000,
//     tgeRatio: 0,
//     lockUpMonths: 12,
//     vestingMonths: 24,
//   },
//   {
//     category: "Investor",
//     recipient: "HfjUePod6URVCGhLsLnMgWB12tJ1pBmxJfbr3njc2VMy",
//     quantity: 1_000_000_000,
//     tgeRatio: 20,
//     lockUpMonths: 4,
//     vestingMonths: 18,
//   },
//   {
//     category: "Liquidity",
//     recipient: "7XXyrDpD5DsxGRL1kygwfa9UMag2CRPoBnmyKigyyUzH",
//     quantity: 1_000_000_000,
//     tgeRatio: 50,
//     lockUpMonths: 0,
//     vestingMonths: 12,
//   },
//   {
//     category: "Reserve",
//     recipient: "D8AVXS4pBxpWKzYjo4HPRUdh6HNs3Xq5Vcmzv3WycmKn",
//     quantity: 500_000_000,
//     tgeRatio: 0,
//     lockUpMonths: 6,
//     vestingMonths: 36,
//   },
// ];

// **********************
// mainnet-beta
// **********************
const vestingInputs: VestingInput[] = [
  {
    category: "ECOSystem",
    recipient: "EsCzPs9t8k2MNScT7XPDeccitBGpirvzfsKcgabR4LMc",
    quantity: 5_000_000_000,
    tgeRatio: 5,
    lockUpMonths: 0,
    vestingMonths: 48,
  },
  {
    category: "Marketing",
    recipient: "C1HKPxYMurZvzkRzdL3cNedRGzUCJvqQ8bFnYZo2QXjy",
    quantity: 1_000_000_000,
    tgeRatio: 15,
    lockUpMonths: 0,
    vestingMonths: 36,
  },
  {
    category: "Team",
    recipient: "Ea6ytaRwhK4kBL7Rbo1RpvBsFWoUr8fG25ugYS3MF8wS",
    quantity: 1_500_000_000,
    tgeRatio: 0,
    lockUpMonths: 12,
    vestingMonths: 24,
  },
  {
    category: "Investor",
    recipient: "55tHpWFAbDSKoBgfy7VYRUBdxkeqnQxxGrnRcyFtAZJR",
    quantity: 1_000_000_000,
    tgeRatio: 20,
    lockUpMonths: 4,
    vestingMonths: 20,
  },
  {
    category: "Liquidity",
    recipient: "2zFbETmJk4w9kUfm7PvkYFAoQFSXHJzu35WeRDWArFAh",
    quantity: 1_000_000_000,
    tgeRatio: 50,
    lockUpMonths: 0,
    vestingMonths: 12,
  },
  {
    category: "Reserve",
    recipient: "9E6A3yaU7u9NeubPUo3MuUcE9gjJ2AvcZnC8EJjm782V",
    quantity: 500_000_000,
    tgeRatio: 0,
    lockUpMonths: 6,
    vestingMonths: 36,
  },
];

function loadKeypair(path: string) {
  const secret = JSON.parse(fs.readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function getVestingInfo(input: VestingInput) {
  const now = Math.floor(Date.now() / 1000);
  const startAt = now + 60; // 1분 뒤 시작

  const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
  // const MONTH_IN_SECONDS = 60 * 10;
  const tgeAmount = input.quantity * (input.tgeRatio / 100);
  const vestingAmount = input.quantity - tgeAmount;
  const vestingStart = startAt + input.lockUpMonths * MONTH_IN_SECONDS;

  const vestingInfos = [];

  if (tgeAmount > 0) {
    vestingInfos.push({
      recipient: input.recipient,
      // escrow에 넣는 총 토큰 수량
      amount: getBN(tgeAmount, tokenConfig.decimals),
      // TGE 물량은 stream 생성 직후 claim 가능하도록 시작
      start: startAt,
      cliff: startAt,
      cliffAmount: getBN(tgeAmount, tokenConfig.decimals),
      // 얼마마다 amountPerPeriod 만큼 풀 것인가
      period: MONTH_IN_SECONDS,
      // cliffAmount가 전체 수량이라 실제 선형 unlock에는 사용되지 않음
      amountPerPeriod: getBN(tgeAmount, tokenConfig.decimals),
      // recipient가 claim할 수 있는 최소 주기
      withdrawalFrequency: MONTH_IN_SECONDS,
      name: `${input.category}-tge`,
    });
  }

  if (vestingAmount > 0) {
    vestingInfos.push({
      recipient: input.recipient,
      // escrow에 넣는 총 토큰 수량
      amount: getBN(vestingAmount, tokenConfig.decimals),
      // vesting schedule 시작 시간
      start: vestingStart,
      // 초기 lock 기간 종료 시간
      cliff: vestingStart,
      // TGE는 별도 stream에서 즉시 풀고, 잔여 vesting stream에는 cliff 물량을 두지 않음
      cliffAmount: getBN(0, tokenConfig.decimals),
      // 얼마마다 amountPerPeriod 만큼 풀 것인가
      period: MONTH_IN_SECONDS,
      // period마다 unlock되는 양
      amountPerPeriod: getBN(
        vestingAmount / input.vestingMonths,
        tokenConfig.decimals,
      ),
      // recipient가 claim할 수 있는 최소 주기
      withdrawalFrequency: MONTH_IN_SECONDS,
      name: `${input.category}-lockup`,
    });
  }

  return vestingInfos;
}

async function main() {
  const sender = loadKeypair(tokenConfig.keypairPath);
  console.log("sender:", sender.publicKey.toBase58());

  const connection = new Connection(RPC_URL, "confirmed");

  const client = new SolanaStreamClient({
    connection,
    clusterUrl: RPC_URL,
    cluster: STREAMFLOW_CLUSTERS[tokenConfig.cluster],
  });

  for (const vestingInput of vestingInputs) {
    for (const vestingInfo of getVestingInfo(vestingInput)) {
      const createData = {
        tokenId: tokenConfig.mint,
        ...vestingInfo,
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

        console.log("CATEGORY:", vestingInput.category);
        console.log("NAME:", vestingInfo.name);
        console.log("RECIPIENT:", vestingInput.recipient);
        console.log("TX:", result.txId);
        console.log("STREAM:", result.metadataId);
      } catch (e) {
        console.error("FAILED:", vestingInfo.name, vestingInput.recipient);
        console.dir(e, { depth: 10 });
      }
    }
  }
}

main();
