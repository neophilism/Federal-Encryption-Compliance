import { readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const roadmap = readJson('registry/roadmap.json');
const registry = readJson('registry/prs.json');
const fail = (message) => {
  throw new Error(`Roadmap evidence invalid: ${message}`);
};

if (roadmap.repository !== registry.repository) fail('repository mismatch');
if (roadmap.version !== registry.roadmapVersion) fail('roadmap version mismatch');
if (roadmap.planVerified !== true || registry.planVerified !== true) fail('plan is not verified');
if (roadmap.plannedPrCount !== registry.plannedPrCount) fail('planned PR count mismatch');
if (roadmap.milestones.length !== roadmap.plannedPrCount) fail('roadmap count does not match milestones');
if (registry.units.length !== roadmap.milestones.length) fail('registry count does not match roadmap');
if (!Number.isFinite(Date.parse(registry.observedAt))) fail('observedAt is not an ISO timestamp');

const pullRequests = new Map(registry.pullRequests.map((pr) => [pr.number, pr]));
if (pullRequests.size !== registry.pullRequests.length) fail('duplicate pull request records');

const milestoneIds = new Set();
const mappedPrs = new Set();
for (const [index, milestone] of roadmap.milestones.entries()) {
  if (milestoneIds.has(milestone.id)) fail(`duplicate milestone ${milestone.id}`);
  milestoneIds.add(milestone.id);
  const unit = registry.units[index];
  if (!unit || unit.id !== milestone.id || unit.title !== milestone.title || unit.origin !== milestone.origin) {
    fail(`unit ${milestone.id} does not match the canonical roadmap`);
  }
  if (!Array.isArray(unit.prs) || unit.prs.length === 0) fail(`unit ${unit.id} has no PR mapping`);
  if (typeof unit.mappingEvidence !== 'string' || unit.mappingEvidence.trim().length < 20) {
    fail(`unit ${unit.id} lacks mapping evidence`);
  }
  for (const number of unit.prs) {
    if (!Number.isInteger(number) || number < 1) fail(`unit ${unit.id} has an invalid PR number`);
    if (mappedPrs.has(number)) fail(`PR #${number} maps to more than one roadmap unit`);
    mappedPrs.add(number);
    const pr = pullRequests.get(number);
    if (!pr) fail(`mapped PR #${number} is absent from the observed ledger`);
    if (pr.state !== 'closed' || !pr.mergedAt) fail(`mapped PR #${number} is not observed merged`);
    if (pr.url !== `https://github.com/${registry.repository}/pull/${number}`) {
      fail(`mapped PR #${number} has a noncanonical URL`);
    }
  }
}

console.log(`Validated ${registry.units.length} roadmap units and ${mappedPrs.size} unique merged PR mappings.`);
