const DELAY_RANGE = {
  MIN: 1300,
  MAX: 1800,
};

const TOGGLE = {
  AUTOMATION: true,
};

chrome.storage.sync.get(["minDelay", "maxDelay", "automationEnabled"], (data) => {
    DELAY_RANGE.MIN = data.minDelay ?? 1300;
    DELAY_RANGE.MAX = data.maxDelay ?? 1800;
    TOGGLE.AUTOMATION = data.automationEnabled ?? false;
});

module.exports = { DELAY_RANGE, TOGGLE };
