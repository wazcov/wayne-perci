import { loadData, writeData } from "./data";
import { validateMembers } from "./validate";
import { startServer } from "./server";

async function main(): Promise<void> {
  console.log("Loading data...");

  const inputPath = process.argv[2] ?? "data.csv";
  const outputPath = process.argv[3] ?? "data.json";

  const rows = await loadData(inputPath);
  const { members, rejected } = validateMembers(rows);
  await writeData(outputPath, members);

  console.log(`Rejected ${rejected.length} rows`);
  for (const { line, reasons } of rejected) {
    console.log(`  line ${line}: ${reasons.join("; ")}`);
  }

  startServer(members);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
