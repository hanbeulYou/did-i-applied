function saveJobPosting(jobId, category = "Wanted") {
  chrome.storage.local.get(["savedJobs"], (result) => {
    const savedJobs = result.savedJobs || {};
    if (!savedJobs[category]) savedJobs[category] = [];
    savedJobs[category].push(jobId);
    chrome.storage.local.set({ savedJobs });
  });
}
