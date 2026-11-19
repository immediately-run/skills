#!/usr/bin/env node
// Repository-specific distribution checks, not a substitute for portal validation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const manifest = read('plugin.json');
const market = read('.claude-plugin/marketplace.json');
const index = read('skills/index.json');
const ui = manifest.extensions?.['com.openai']?.interface;
const bounded = (value, max, label) => {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert(value.trim().length > 0 && value.length <= max, `${label} must have 1–${max} characters`);
};
const localFile = (relative) => {
  assert(relative.startsWith('./') && !relative.includes('..') && !relative.includes('\\'), `invalid package path: ${relative}`);
  const file = path.resolve(root, relative);
  assert(file.startsWith(root + path.sep), `path escapes package: ${relative}`);
  assert(fs.lstatSync(file).isFile(), `not a regular file: ${relative}`);
  return file;
};

assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.match(manifest.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
bounded(manifest.name, 64, 'name');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(manifest.name, market.plugins[0].name, 'plugin identities differ');
assert.equal(manifest.version, market.plugins[0].version, 'release versions differ');
bounded(manifest.description, 4000, 'description');
bounded(manifest.author?.name, 120, 'author.name');
for (const [key, max] of Object.entries({displayName:30, shortDescription:30, longDescription:4000, category:80})) {
  bounded(ui?.[key], max, `interface.${key}`);
}
if (ui.developerName !== undefined) bounded(ui.developerName, 80, 'interface.developerName');
assert.equal(ui.category, 'Developer Tools');
assert(Array.isArray(ui.capabilities));
assert(ui.capabilities.length <= 20);
for (const capability of ui.capabilities) bounded(capability, 120, 'capability');
for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  if (ui[key] === undefined && !['websiteURL', 'supportURL'].includes(key)) continue;
  bounded(ui[key], 1024, key);
  const url = new URL(ui[key]);
  assert.equal(url.protocol, 'https:');
  assert(!url.username && !url.password);
}
assert(Array.isArray(ui.defaultPrompt) && ui.defaultPrompt.length <= 3);
for (const prompt of ui.defaultPrompt) {
  bounded(prompt, 128, 'defaultPrompt');
  assert(!/[\r\n@]/.test(prompt), 'starter prompts must be single-line without mentions');
}
assert.equal(new Set(ui.defaultPrompt.map(p => p.trim().replace(/\s+/g, ' '))).size, ui.defaultPrompt.length);
for (const key of ['composerIcon', 'logo']) {
  const file = localFile(ui[key]);
  const bytes = fs.readFileSync(file);
  assert(bytes.length <= 5 * 1024 * 1024, `${key} exceeds 5 MiB`);
  assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a', `${key} must be PNG for this package`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const minimum = key === 'logo' ? 256 : 48;
  assert(width === height && width >= minimum && width <= 4096, `${key} must be square, ${minimum}–4096 pixels`);
}
for (const skill of index.skills) {
  for (const relative of skill.files) localFile(`./skills/${skill.name}/${relative}`);
  const yaml = fs.readFileSync(path.join(root, 'skills', skill.name, 'agents/openai.yaml'), 'utf8');
  assert(yaml.includes(`$${skill.name}`), `${skill.name}: default prompt must invoke the skill`);
}
assert(!fs.existsSync(path.join(root, 'mcp.json')), 'Review packaging if an MCP server is introduced');
assert(!fs.existsSync(path.join(root, 'hooks')), 'Directory package must not acquire lifecycle hooks implicitly');
const openai = manifest.extensions['com.openai'];
assert(!openai.review?.test_cases, 'Skills-only review uses prompts, not MCP test cases');
assert(Array.isArray(openai.review?.prompts) && openai.review.prompts.length <= 20);
for (const prompt of openai.review.prompts) bounded(prompt, 4000, 'review prompt');
const missing = ['developerName', 'privacyPolicyURL', 'termsOfServiceURL'].filter(key => !ui[key]);
if (typeof openai.review?.commerce !== 'boolean') missing.push('review.commerce');
if (!Array.isArray(openai.publication?.countries)) missing.push('publication.countries');
if (process.argv.includes('--submission')) {
  assert.equal(missing.length, 0, `Missing confirmed submission metadata: ${missing.join(', ')}`);
}
console.log(`Plugin checks passed: ${manifest.name}@${manifest.version}; ${index.skills.length} self-contained skills; package valid locally.`);
if (missing.length) console.log(`Public submission incomplete: ${missing.join(', ')}. Local checks do not verify portal readiness.`);
