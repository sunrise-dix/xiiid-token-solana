import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplTokenMetadata,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const umi = createUmi("https://api.devnet.solana.com").use(mplTokenMetadata());

const omitUndefined = (value) => {
  if (value?.__option === "None") {
    return undefined;
  }

  if (value?.__option === "Some") {
    return omitUndefined(value.value);
  }

  if (Array.isArray(value)) {
    return value.map(omitUndefined).filter((entryValue) => entryValue !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([entryKey, entryValue]) => [entryKey, omitUndefined(entryValue)])
        .filter(([, entryValue]) => entryValue !== undefined),
    );
  }

  return value;
};

const toBonkLikeMetadata = (metadata) =>
  omitUndefined({
    key: metadata.key,
    updateAuthority: metadata.updateAuthority,
    mint: metadata.mint,
    data: {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    },
    primarySaleHappened: Number(metadata.primarySaleHappened),
    isMutable: Number(metadata.isMutable),
    editionNonce: metadata.editionNonce,
    tokenStandard: metadata.tokenStandard,
    collection: metadata.collection,
    uses: metadata.uses,
  });

try {
  const asset = await fetchDigitalAsset(
    umi,
    publicKey("6xSShRCT67tcEnhQzyo31w6MvHnMKfgDgSU2qFWMzoTC"),
  );

  console.dir(toBonkLikeMetadata(asset.metadata), { depth: null });
} catch (e) {
  console.error("Metadata NOT found");
  console.error(e);
}
