const DELAY_RANGE = { MIN: 1300, MAX: 1800 };
const TOGGLE = { AUTOMATION: false };

let _initialized = false;

/**
 * Loads settings and mutates DELAY_RANGE and TOGGLE in place.
 * Returns a Promise that resolves once initialization is complete.
 */

function loadSettings() {
  if (_initialized) return Promise.resolve({ DELAY_RANGE, TOGGLE });

  return new Promise((resolve) => {
    chrome.storage.sync.get(["minDelay", "maxDelay", "automationEnabled"], (data) => {
      data = data || {};
      DELAY_RANGE.MIN = typeof data.minDelay === 'number' ? data.minDelay : 1300;
      DELAY_RANGE.MAX = typeof data.maxDelay === 'number' ? data.maxDelay : 1800;
      TOGGLE.AUTOMATION = typeof data.automationEnabled === 'boolean' ? data.automationEnabled : false;
      _initialized = true;
      resolve({ DELAY_RANGE, TOGGLE });
    });
  });
}

module.exports = { DELAY_RANGE, TOGGLE, loadSettings };
