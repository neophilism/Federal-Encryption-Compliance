import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import test from "node:test";

test("accountability runtime stays on SDK and downstream oversight boundaries", async () => {
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

    assert.equal(
      /\.request\s*(?:<|\()/.test(
        source,
      ),
      false,
      file +
        " must use typed @caiae/sdk methods rather than raw engine request routes",
    );

    for (
      const forbidden of [
        "@caiae/findings",
        "@caiae/certifications",
        "@caiae/db",
        "@caiae/core",
        "@caiae/deadlines",
        "@caiae/rules",
        "@caiae/evidence",
        "@caiae/authorization",
        "@caiae/exceptions",
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
