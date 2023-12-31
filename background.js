chrome.alarms.onAlarm.addListener(
    () => {
        chrome.notifications.create(
            {
                type: "basic",
                iconUrl: "alarm.png",
                title: "Stay Healthy!",
                message: "Stand and look away, buddy.",
            },
            () => { }
        )
    },
)
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.time)
            createAlarm();
            sendResponse("Alarm created successfully!");
    }
);

function createAlarm() {
    chrome.alarms.create(
        "stay_healthy",
        {
            delayInMinutes: 20,
            periodInMinutes: 20
        }
    );
}
