// Request notification permission when extension loads
chrome.runtime.onInstalled.addListener(() => {
  // Request notification permissions immediately
  chrome.permissions.contains(
    {
      permissions: ["notifications"],
    },
    (result) => {
      if (!result) {
        chrome.permissions.request({
          permissions: ["notifications"],
        });
      }
    }
  );

  chrome.notifications.getPermissionLevel((permissionLevel) => {
    console.log("Notification permission level:", permissionLevel);
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "stay_healthy") {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "alarm.png",
        title: "Stay Healthy!",
        message: "Time to take a break!",
        priority: 2,
        requireInteraction: true,
      },
      function (notificationId) {
        console.log("Notification sent:", notificationId);
        if (chrome.runtime.lastError) {
          console.error("Notification error:", chrome.runtime.lastError);
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "reset") {
      chrome.alarms.clear("stay_healthy", () => {
        if (chrome.runtime.lastError) {
          console.error("Error clearing alarm:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true });
        }
      });
      return true;
    }

    if (request.time) {
      const minutes = parseInt(request.time);
      if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
        sendResponse({ success: false, error: "Invalid time value" });
        return true;
      }

      createAlarm(minutes);
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Error in message handler:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

function createAlarm(minutes) {
  console.log("Creating alarm for", minutes, "minutes");
  chrome.alarms.clear("stay_healthy", () => {
    chrome.alarms.create("stay_healthy", {
      delayInMinutes: minutes,
      periodInMinutes: minutes,
    });
    console.log("Alarm created successfully");

    // Verify alarm was created
    chrome.alarms.get("stay_healthy", (alarm) => {
      console.log("Current alarm:", alarm);
    });
  });
}
