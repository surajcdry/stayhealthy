const start = document.getElementById("start");
const timer = document.getElementById("timer");
const reset = document.getElementById("reset");
const countdownDisplay = document.getElementById("countdown");

let countdownInterval;

// Load saved timer value when popup opens
chrome.storage.local.get(["timerValue"], (result) => {
  if (result.timerValue) {
    timer.value = result.timerValue;
  }
});

function updateCountdown(endTime) {
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownDisplay.textContent = "Time for a break!";
      countdownDisplay.classList.add("countdown-ended");
      countdownDisplay.classList.remove("countdown-active");
      return;
    }

    const minutesLeft = Math.floor(timeLeft / 60000);
    const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

    countdownDisplay.textContent = `Next break in: ${minutesLeft}m ${secondsLeft}s`;
    countdownDisplay.classList.add("countdown-active");
    countdownDisplay.classList.remove("countdown-ended");
  }, 1000);
}

reset.addEventListener("click", () => {
  timer.value = "25";
  chrome.storage.local.remove(["timerValue"]); // Clear saved value on reset
  timer.disabled = false; // Re-enable the input field
  clearInterval(countdownInterval);
  countdownDisplay.textContent = "";
  countdownDisplay.classList.remove("countdown-active", "countdown-ended");

  chrome.runtime.sendMessage({ action: "reset" });
});

start.addEventListener("click", () => {
  const minutes = parseInt(timer.value);

  // Improved input validation
  if (isNaN(minutes) || minutes <= 0) {
    countdownDisplay.textContent = "Please enter a valid time (1-999 minutes)";
    countdownDisplay.classList.add("error");
    return;
  }

  if (minutes > 999) {
    countdownDisplay.textContent = "Maximum time allowed is 999 minutes";
    countdownDisplay.classList.add("error");
    return;
  }

  countdownDisplay.classList.remove("error");

  // Save timer value when starting
  chrome.storage.local.set({ timerValue: minutes });

  const endTime = Date.now() + minutes * 60 * 1000;

  start.disabled = true;
  start.textContent = "Starting...";

  chrome.runtime.sendMessage({ time: minutes }, (response) => {
    if (response && response.success) {
      // Disable the input field when timer starts
      timer.disabled = true;
      updateCountdown(endTime);
      start.textContent = "Timer Started";
      setTimeout(() => {
        start.disabled = false;
        start.textContent = "Start";
      }, 2000);
    } else {
      start.disabled = false;
      start.textContent = "Start";
      countdownDisplay.textContent = "Failed to start timer";
      countdownDisplay.classList.add("error");
    }
  });
});

// Check for existing alarm when popup opens
chrome.alarms.get("stay_healthy", (alarm) => {
  if (alarm) {
    // If there's an existing alarm, disable the input
    timer.disabled = true;
    updateCountdown(alarm.scheduledTime);
  } else {
    timer.disabled = false;
  }
});
