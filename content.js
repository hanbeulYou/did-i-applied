// 페이지 로드 후 바로 실행
console.log("You are now on wanted.co.kr");

// Click 이벤트 리스너 설정
document.addEventListener("click", (e) => {
  console.log("Click event triggered:", e);

  const applyButton = e.target.closest("[data-attribute-id='apply__start']");
  console.log("applyButton:", applyButton);

  if (applyButton) {
    const positionId = applyButton.getAttribute("data-position-id");

    // chrome.storage.local에서 이미 저장된 job 데이터를 확인
    chrome.storage.local.get(["savedJobs"], (result) => {
      const savedJobs = result.savedJobs || {};
      const appliedJobIds = savedJobs["Wanted"]
        ? savedJobs["Wanted"].map((job) => job.positionId)
        : [];

      // 현재 positionId가 이미 저장되어 있는지 확인
      if (appliedJobIds.includes(positionId)) {
        console.log("This job has already been saved.");
        return; // 중복된 positionId라면 함수 종료
      }

      // 새로운 데이터 저장을 위한 companyData 생성
      const companyData = {
        companyId: applyButton.getAttribute("data-company-id"),
        companyName: applyButton.getAttribute("data-company-name"),
        positionId: positionId,
        positionName: applyButton.getAttribute("data-position-name"),
      };

      // companyLogo는 article 요소에서 가져오기
      const companyInfo = document.querySelector(
        "[class*='CompanyInfo_CompanyInfo']"
      );
      const companyLogo = companyInfo
        ? companyInfo.querySelector("a[data-attribute-id='company__click'] img")
            ?.src || ""
        : "";

      console.log("companyInfo", companyInfo);
      console.log("companyLogo", companyLogo);

      companyData.logoUrl = companyLogo;

      console.log("companyData:", companyData);

      // background.js로 메시지를 보내 저장 요청
      chrome.runtime.sendMessage(
        {
          action: "saveJobPosting",
          jobData: companyData,
          category: "Wanted",
        },
        (response) => {
          if (response && response.status === "saved") {
            console.log("Job posting saved successfully.");
          } else {
            console.error(
              "Failed to save job posting:",
              response ? response.message : "Unknown error"
            );
          }
        }
      );
    });
  }
});

// 기존 지원 정보 확인 및 오버레이 추가
chrome.storage.local.get(["savedJobs"], (result) => {
  const savedJobs = result.savedJobs || {};
  const appliedJobIds = savedJobs["Wanted"]
    ? savedJobs["Wanted"].map((job) => job.positionId)
    : [];

  console.log("savedJobs:", savedJobs);
  console.log("appliedJobIds:", appliedJobIds);

  // MutationObserver 설정: 동적으로 추가되는 공고 카드 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // 노드 내부에 a[data-attribute-id='position__click'] 요소가 있는지 확인
          const jobCard = node.querySelector(
            "a[data-attribute-id='position__click']"
          );
          if (jobCard) {
            console.log("New jobCard added:", jobCard);
            applyOverlayIfApplied(jobCard, appliedJobIds);
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 페이지에 이미 로드된 공고 카드에 오버레이 적용
  document
    .querySelectorAll("a[data-attribute-id='position__click']")
    .forEach((jobCard) => {
      console.log("Applying overlay to existing jobCard:", jobCard);
      applyOverlayIfApplied(jobCard, appliedJobIds);
    });
});

// 오버레이 적용 함수
function applyOverlayIfApplied(jobCard, appliedJobIds) {
  const positionId = jobCard.getAttribute("data-position-id");
  console.log("Checking positionId for overlay:", positionId);

  if (appliedJobIds.includes(positionId)) {
    const imageContainer = jobCard.querySelector("img");

    if (imageContainer && !jobCard.querySelector(".applied-overlay")) {
      imageContainer.style.filter = "blur(4px)";

      const overlay = document.createElement("div");
      overlay.className = "applied-overlay";
      overlay.textContent = "이미 지원함";
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.color = "white";
      overlay.style.fontSize = "20px";
      overlay.style.fontWeight = "bold";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

      imageContainer.parentElement.style.position = "relative";
      imageContainer.parentElement.appendChild(overlay);
      console.log("Overlay applied to jobCard with positionId:", positionId);
    }
  }
}
