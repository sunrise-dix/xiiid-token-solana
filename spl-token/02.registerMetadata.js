import fs from "fs";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {
  createMetadataAccountV3,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import { keypairIdentity, none, publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";

const MINT_ADDRESS = "4rzbhSUnLEj1xPt8gt72hdJAY4WK3BjdU96vPCgwj8qp";

const METADATA_URI = "https://xclass-dev.web.app/token/metadata.json";

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("/Users/sunrise/.config/solana/id.json", "utf8")),
);

const umi = createUmi("https://api.devnet.solana.com").use(mplTokenMetadata());

const payer = umi.eddsa.createKeypairFromSecretKey(secret);

umi.use(keypairIdentity(payer));

const mint = publicKey(MINT_ADDRESS);

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
