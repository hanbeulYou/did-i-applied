// 메시지로 요청받은 데이터 저장
function saveJobPosting(jobData, category = "Wanted") {
  chrome.storage.local.get(["savedJobs"], (result) => {
    const savedJobs = result.savedJobs || {};
    if (!savedJobs[category]) savedJobs[category] = [];
    savedJobs[category].push(jobData);
    chrome.storage.local.set({ savedJobs });
  });
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveJobPosting") {
    saveJobPosting(message.jobData, message.category);
    sendResponse({ status: "saved" });
  } else {
    sendResponse({ status: "error", message: "Action not recognized" });
  }
});
