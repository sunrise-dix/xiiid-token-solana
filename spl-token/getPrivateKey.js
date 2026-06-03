import fs from "fs";
import bs58 from "bs58";

const secret = Uint8Array.from(
  JSON.parse(fs.readFileSync("wallet/recipient.json", "utf8")),
);

console.log(bs58.encode(secret));
