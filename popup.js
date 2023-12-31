
const ele = document.getElementById("btn")
ele.addEventListener("click", () => {
    chrome.runtime.sendMessage({ time: "20" }, function (response) {
        console.log(response);
    });
}); 