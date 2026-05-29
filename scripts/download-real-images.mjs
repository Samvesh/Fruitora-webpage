import { fruits, recipes } from "../backend/src/data/fruitData.js";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fruitDir = join(root, "frontend", "public", "fruits");
const recipeDir = join(root, "frontend", "public", "recipes");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const query = (value) =>
  encodeURIComponent(
    value
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

async function downloadPhoto(url, target) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "FruitoraLocalAssetDownloader/1.0" }
  });
  if (!response.ok) throw new Error(`Download failed ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 15000) throw new Error("Downloaded file is too small to be a usable photo");
  await writeFile(target, bytes);
}

async function main() {
  await mkdir(fruitDir, { recursive: true });
  await mkdir(recipeDir, { recursive: true });

  const report = { fruits: [], recipes: [], failed: [] };

  for (const fruit of fruits) {
    const url = `https://loremflickr.com/1400/1000/${query(`${fruit.name} fruit`)}`;
    try {
      await downloadPhoto(url, join(fruitDir, `${fruit.slug}.jpg`));
      report.fruits.push({ slug: fruit.slug, file: `/fruits/${fruit.slug}.jpg`, source: url });
      console.log(`fruit ${fruit.slug}`);
    } catch (error) {
      report.failed.push({ type: "fruit", slug: fruit.slug, error: error.message });
      console.warn(`failed fruit ${fruit.slug}: ${error.message}`);
    }
    await sleep(120);
  }

  const fruitBySlug = new Map(fruits.map((fruit) => [fruit.slug, fruit]));
  for (const recipe of recipes) {
    const fruit = fruitBySlug.get(recipe.fruitSlugs[0]);
    const url = `https://loremflickr.com/1400/1000/${query(`${fruit.name} ${recipe.category} food recipe`)}`;
    try {
      await downloadPhoto(url, join(recipeDir, `${recipe.id}.jpg`));
      report.recipes.push({ id: recipe.id, file: `/recipes/${recipe.id}.jpg`, source: url });
      console.log(`recipe ${recipe.id}`);
    } catch (error) {
      report.failed.push({ type: "recipe", id: recipe.id, error: error.message });
      console.warn(`failed recipe ${recipe.id}: ${error.message}`);
    }
    await sleep(120);
  }

  await writeFile(join(root, "frontend", "public", "image-sources.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ fruits: report.fruits.length, recipes: report.recipes.length, failed: report.failed.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
