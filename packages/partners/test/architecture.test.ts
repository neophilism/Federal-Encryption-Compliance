import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import test from "node:test";

test("partner runtime stays on the SDK boundary", async () => {
  const src =
    new URL(
      "../src/",
      import.meta.url,
    );
  const files =
    await readdir(src);

  for (
    const file of files
  ) {
    if (
      !file.endsWith(".ts")
    ) {
      continue;
    }

    const source =
      await readFile(
        new URL(
          file,
          src,
        ),
        "utf8",
      );

    assert.equal(
      source.includes(
        '"@caiae/rules"',
      ),
      false,
      file +
        " must not import the upstream rules package at runtime",
    );
    assert.equal(
      source.includes(
        '"@caiae/db"',
      ),
      false,
      file +
        " must not import the upstream database package",
    );
  }
});
