const minDelayInput = document.getElementById("minDelay");
const maxDelayInput = document.getElementById("maxDelay");
const minLabel = document.getElementById("minLabel");
const maxLabel = document.getElementById("maxLabel");
const saveBtn = document.getElementById("saveBtn");
const automationToggle = document.getElementById("automationToggle");

// Label updates
minDelayInput.addEventListener("input", () => {
  minLabel.textContent = minDelayInput.value;
});
maxDelayInput.addEventListener("input", () => {
  maxLabel.textContent = maxDelayInput.value;
});

// Load saved state
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["minDelay", "maxDelay", "automationEnabled"], (data) => {
    const min = data.minDelay ?? 1300;
    const max = data.maxDelay ?? 1800;
    const enabled = data.automationEnabled ?? false;

    minDelayInput.value = min;
    maxDelayInput.value = max;
    minLabel.textContent = min;
    maxLabel.textContent = max;

    setToggleState(enabled);
  });
});

// Save button
saveBtn.addEventListener("click", () => {
  const min = parseInt(minDelayInput.value);
  const max = parseInt(maxDelayInput.value);

  if (min > max) {
    alert("Min delay cannot be greater than max delay.");
    return;
  }

  chrome.storage.sync.set({ minDelay: min, maxDelay: max }, () => {
    showToast("Delay range saved");
  });
});


// Toggle logic
automationToggle.addEventListener("click", () => {
  const isActive = automationToggle.classList.toggle("active");

  chrome.storage.sync.set({ automationEnabled: isActive });

  const min = parseInt(minDelayInput.value);
  const max = parseInt(maxDelayInput.value);

  if (min > max) {
    alert("Invalid delay range.");
    setToggleState(false);
    return;
  }

  chrome.runtime.sendMessage({
    type: isActive ? "START_AUTOMATION" : "STOP_AUTOMATION",
    delayRange: { min, max }
  }, (response) => {
    console.log("Automation toggled:", response);
  });
});

function setToggleState(active) {
  if (active) {
    automationToggle.classList.add("active");
  } else {
    automationToggle.classList.remove("active");
  }
}


function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  // Clear any existing timeout to avoid stacking fades
  if (toast.hideTimeout) {
    clearTimeout(toast.hideTimeout);
  }

  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

