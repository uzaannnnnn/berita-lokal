const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (!m) return;
    const key = m[1];
    let val = m[2] || "";
    // strip surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const envPath = path.join(repoRoot, ".env.local");
  loadEnv(envPath);

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    console.error(
      "Missing R2 config. Check .env.local for R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET"
    );
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });

  try {
    const key = `test-upload-${Date.now()}.txt`;
    const res = await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: "hello from local test",
        ContentType: "text/plain",
      })
    );
    console.log(
      "Upload success, response metadata:",
      res && res.$metadata ? res.$metadata : res
    );
    console.log(
      "Public URL candidate:",
      (process.env.R2_PUBLIC_URL ||
        `${endpoint.replace(/\/$/, "")}/${bucket}`) +
        "/" +
        key
    );
  } catch (err) {
    console.error("Upload failed:");
    console.error(err);
    if (err && err.Code) console.error("Provider Code:", err.Code);
    if (err && err.Message) console.error("Provider Message:", err.Message);
    process.exit(2);
  }
}

main();
