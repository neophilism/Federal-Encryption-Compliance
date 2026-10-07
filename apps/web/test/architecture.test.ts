import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import test from "node:test";

const roots = [
  "../app/",
  "../components/",
  "../lib/",
];

test("web runtime remains on the SDK boundary and client components cannot access operator credentials", async () => {
  const files:
    URL[] = [];

  for (
    const root of roots
  ) {
    await collect(
      new URL(
        root,
        import.meta.url,
      ),
      files,
    );
  }

  for (
    const file of files
  ) {
    const source =
      await readFile(
        file,
        "utf8",
      );

    for (
      const forbidden of [
        "@caiae/db",
        "@caiae/reporting",
        "@caiae/findings",
        "@caiae/certifications",
        "@caiae/deadlines",
        "@caiae/evidence",
        "@caiae/rules",
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
        file.pathname +
          " must not import " +
          forbidden,
      );
    }

    assert.equal(
      /\.request\s*(?:<|\()/.test(
        source,
      ),
      false,
      file.pathname +
        " must use typed @caiae/sdk methods rather than raw engine request routes",
    );

    if (
      source.trimStart()
        .startsWith(
          '"use client"',
        )
    ) {
      assert.equal(
        source.includes(
          "CAIAE_OPERATOR_TOKEN",
        ),
        false,
        file.pathname +
          " must not reference the operator credential from a client component",
      );
      assert.equal(
        source.includes(
          "createOperatorEngineClient",
        ),
        false,
        file.pathname +
          " must not instantiate an operator client from a client component",
      );
    }
  }
});

async function collect(
  directory: URL,
  files: URL[],
): Promise<void> {
  const entries =
    await readdir(
      directory,
      {
        withFileTypes:
          true,
      },
    );

  for (
    const entry of entries
  ) {
    const target =
      new URL(
        entry.name +
          (entry.isDirectory()
            ? "/"
            : ""),
        directory,
      );

    if (
      entry.isDirectory()
    ) {
      await collect(
        target,
        files,
      );
      continue;
    }

    if (
      entry.name.endsWith(
        ".ts",
      ) ||
      entry.name.endsWith(
        ".tsx",
      )
    ) {
      files.push(target);
    }
  }
}
