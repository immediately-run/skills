const test = require('node:test');
const assert = require('node:assert/strict');
const { findReportFrame } = require('../skills/grove-report/scripts/find-report-frame.cjs');

const frame = (url, report, detached = false) => ({
  url: () => url,
  locator: (selector) => ({ count: async () => {
    if (detached) throw new Error('Frame detached');
    return selector === '.grove-root h1' && report ? 1 : 0;
  } }),
});
const page = (...frames) => ({ mainFrame: () => frames[0], frames: () => frames });

test('finds the report on sandbox-m3 without mistaking the host shell for it', async () => {
  const shell = frame('https://immediately.run/present/github/example/report/main', true);
  const empty = frame('about:blank', false);
  const report = frame('https://sandbox-m3.immediately.run/m3.html', true);
  assert.equal(await findReportFrame(page(shell, empty, report)), report);
});
test('a generic sandbox frame without Grove content is not a rendered report', async () => {
  assert.equal(await findReportFrame(page(frame('https://immediately.run', false), frame('https://sandbox.immediately.run', false))), null);
});
test('continues past a detached frame while the host loads the report', async () => {
  const report = frame('https://a-new-sandbox.immediately.run', true);
  assert.equal(await findReportFrame(page(frame('https://immediately.run', false), frame('about:blank', false, true), report)), report);
});
