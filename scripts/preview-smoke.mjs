const rawBase =
  process.env.PREVIEW_BASE_URL ??
  process.argv[2];

if (!rawBase) {
  console.error(
    "PREVIEW_BASE_URL or a base URL argument is required",
  );
  process.exit(2);
}

const base = rawBase.replace(/\/$/, "");
const checks = [
  {
    path: "/",
    expect: 200,
  },
  {
    path: "/api/config",
    expect: 200,
  },
];

let failed = false;

for (const check of checks) {
  const response = await fetch(
    base + check.path,
    {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    },
  );

  const ok =
    response.status === check.expect;

  console.log(
    JSON.stringify({
      path: check.path,
      status: response.status,
      expected: check.expect,
      ok,
    }),
  );

  if (!ok) failed = true;
}

if (failed) {
  process.exit(1);
}
