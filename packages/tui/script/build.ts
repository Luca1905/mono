#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "bun";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.resolve(__dirname, "..");

process.chdir(dir);

import pkg from "../package.json";

const allTargets: {
  os: string;
  arch: "arm64" | "x64";
  abi?: "musl";
  avx2?: false;
}[] = [
  {
    os: "linux",
    arch: "arm64",
  },
  {
    os: "linux",
    arch: "x64",
  },
  {
    os: "linux",
    arch: "x64",
    avx2: false,
  },
  {
    os: "linux",
    arch: "arm64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
  },
  {
    os: "linux",
    arch: "x64",
    abi: "musl",
    avx2: false,
  },
  {
    os: "darwin",
    arch: "arm64",
  },
];

await $`rm -rf dist`;

const binaries: Record<string, string> = {};

await $`bun install --os="*" --cpu="*" @opentui/core@${pkg.dependencies["@opentui/core"]}`;

for (const item of allTargets) {
  const name = [
    pkg.name,
    // changing to win32 flags npm for some reason
    item.os === "win32" ? "windows" : item.os,
    item.arch,
    item.avx2 === false ? "baseline" : undefined,
    item.abi === undefined ? undefined : item.abi,
  ]
    .filter(Boolean)
    .join("-");
  console.log(`building ${name}`);
  await $`mkdir -p dist/${name}/bin`;

  const localPath = path.resolve(
    dir,
    "node_modules/@opentui/core/parser.worker.js",
  );
  const rootPath = path.resolve(
    dir,
    "../../node_modules/@opentui/core/parser.worker.js",
  );
  const parserWorker = fs.realpathSync(
    fs.existsSync(localPath) ? localPath : rootPath,
  );

  await Bun.build({
    conditions: ["browser"],
    tsconfig: "./tsconfig.json",
    external: ["node-gyp"],
    format: "esm",
    minify: true,
    splitting: true,
    env: "inline",
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      autoloadTsconfig: true,
      autoloadPackageJson: true,
      // biome-ignore lint/suspicious/noExplicitAny: string is actually target type
      target: name.replace(pkg.name, "bun") as any,
      outfile: `dist/${name}/bin/mono`,
      windows: {},
    },
    entrypoints: ["./src/index.tsx", parserWorker],
  });

  await $`rm -rf ./dist/${name}/bin/tui`;
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version: "0.0.1",
        os: [item.os],
        cpu: [item.arch],
      },
      null,
      2,
    ),
  );
  binaries[name] = "0.0.1";
}

export { binaries };
