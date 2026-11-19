// Select the report by its rendered content, not a versioned sandbox hostname.
async function findReportFrame(page) {
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    try {
      if (await frame.locator('.grove-root h1').count()) return frame;
    } catch {
      // A frame can detach while the host is starting or changing revisions.
    }
  }
  return null;
}
module.exports = { findReportFrame };
