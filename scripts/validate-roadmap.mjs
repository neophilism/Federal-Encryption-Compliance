import { readFileSync } from 'node:fs';
import { parsePrRegistry } from '../registry/pr-contract.mjs';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const registry = readJson('registry/prs.json');
const retired = readJson('registry/roadmap.json');
const fail = (message) => { throw new Error(`PR registry evidence invalid: ${message}`); };

if (retired.repository !== registry.repository || retired.deprecated !== true ||
    retired.redirectTo !== 'registry/prs.json' ||
    Object.hasOwn(retired, 'milestones') || Object.hasOwn(retired, 'units') ||
    Object.hasOwn(retired, 'plannedPrCount')) fail('retired roadmap contains an active plan');
const parsed = parsePrRegistry(JSON.stringify(registry), registry.repository);
if (!registry.planVerified || parsed.items.length !== 9) fail('approved nine-unit plan changed');
const pullRequests = new Map(parsed.pullRequests.map(pr => [pr.number, pr]));
const mapped = new Set();
for (const unit of registry.units) {
  if (typeof unit.mappingEvidence !== 'string' || unit.mappingEvidence.trim().length < 20)
    fail(`unit ${unit.id} lacks mapping evidence`);
  if (!Array.isArray(unit.prs) || unit.prs.length === 0) fail(`unit ${unit.id} has no PR mapping`);
  for (const number of unit.prs) {
    if (mapped.has(number)) fail(`PR #${number} maps to multiple completed units`);
    mapped.add(number);
    const pr = pullRequests.get(number);
    if (!pr || pr.state !== 'closed' || !pr.mergedAt)
      fail(`PR #${number} lacks observed merge evidence`);
  }
}
console.log(`Validated ${registry.units.length} approved units and ${mapped.size} unique merged PR mappings; production acceptance is separate.`);
