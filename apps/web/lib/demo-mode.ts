export type DemoEnvironment = {
  FDEA_DEMO_MODE?: string;
};

export function isFederalDemoMode(
  env: DemoEnvironment =
    process.env as DemoEnvironment,
): boolean {
  const value =
    env.FDEA_DEMO_MODE
      ?.trim()
      .toLowerCase();

  return (
    value === "true" ||
    value === "1" ||
    value === "yes" ||
    value === "on"
  );
}
