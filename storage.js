export function saveJobPosting(companyData, category = "Wanted") {
  chrome.storage.local.get(["savedJobs"], (result) => {
    const savedJobs = result.savedJobs || {};
    if (!savedJobs[category]) savedJobs[category] = [];
    savedJobs[category].push(companyData);
    chrome.storage.local.set({ savedJobs });
  });
}
