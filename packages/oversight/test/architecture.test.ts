import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import test from "node:test";

test("statutory-clock runtime stays on the SDK boundary", async () => {
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
      !file.endsWith(
        ".ts",
      )
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

    for (
      const forbidden of [
        "@caiae/deadlines",
        "@caiae/db",
        "@caiae/rules",
        "@caiae/core",
        "@caiae/authorization",
        "@caiae/exceptions",
        "@caiae/evidence",
        "@caiae/findings",
        "@caiae/certifications",
      ]
    ) {
      assert.equal(
        source.includes(
          '"' +
            forbidden +
            '"',
        ),
        false,
        file +
          " must not import " +
          forbidden,
      );
    }
  }
});
