import fs from "fs";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";

import {
  createMetadataAccountV3,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import { keypairIdentity, none, publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

// const METADATA_URI = "https://xclass-dev.web.app/token/metadata.json";
const METADATA_URI = "https://xclass.xiiid.ai/token/metadata.json";
//
const tokenConfig = JSON.parse(
  fs.readFileSync(
    new URL("./config/token-config.json", import.meta.url),
    "utf8",
  ),
);

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync(tokenConfig.keypairPath, "utf8")),
);

const umi = createUmi(clusterApiUrl(tokenConfig.cluster)).use(
  mplTokenMetadata(),
);

const payer = umi.eddsa.createKeypairFromSecretKey(secret);

umi.use(keypairIdentity(payer));

const mint = publicKey(tokenConfig.mint);

const metadataData = {
  name: "XIIID",
  symbol: "XIIID",
  uri: METADATA_URI,
  sellerFeeBasisPoints: 0,
  creators: none(),
  collection: none(),
  uses: none(),
};

const createTokenMetadata = async () => {
  const { signature } = await createMetadataAccountV3(umi, {
    mint,
    mintAuthority: umi.identity,
    payer: umi.identity,
    updateAuthority: umi.identity.publicKey,
    data: metadataData,
    isMutable: false,
    collectionDetails: none(),
  }).sendAndConfirm(umi);

  console.log("Metadata Registered");
  console.log(base58.deserialize(signature));
};

await createTokenMetadata();
