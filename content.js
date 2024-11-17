// 페이지 로드 후 바로 실행
console.log("You are now on wanted.co.kr");

function findClosestOrChild(element, selector) {
  if (element.matches(selector)) {
    return element; // 현재 요소가 선택자와 일치
  }
  return element.querySelector(selector); // 자식 요소 탐색
}

// Click 이벤트 리스너 설정
document.addEventListener("click", (e) => {
  console.log("Click event triggered:", e.target);

  // 사용 예시
  const applyButton = findClosestOrChild(
    e.target,
    "[data-attribute-id='apply__done__net']"
  );
  console.log("applyButton:", applyButton);

  if (applyButton && !applyButton.disabled) {
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

// 공통 함수: 저장된 지원 정보를 가져와서 오버레이 적용
function applySavedJobsOverlay() {
  chrome.storage.local.get(["savedJobs"], (result) => {
    const savedJobs = result.savedJobs || {};
    const appliedJobIds = savedJobs["Wanted"]
      ? savedJobs["Wanted"].map((job) => job.positionId)
      : [];

    // console.log("savedJobs:", savedJobs);
    // console.log("appliedJobIds:", appliedJobIds);

    // 모든 공고 카드에 오버레이 적용
    document
      .querySelectorAll("a[data-attribute-id='position__click']")
      .forEach((jobCard) => {
        applyOverlayIfApplied(jobCard, appliedJobIds);
      });
  });
}

// DOM 변화 감지: 새로 추가된 공고 카드에 오버레이 적용
function observeDOMChanges() {
  const observer = new MutationObserver(() => {
    // console.log("DOM changed. Reapplying overlays...");
    applySavedJobsOverlay(); // 변화가 있을 때마다 저장된 데이터를 다시 적용
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// 뒤로 가기 이벤트 처리
window.addEventListener("popstate", () => {
  console.log("Popstate detected. Reapplying overlays.");
  applySavedJobsOverlay();
});

// 오버레이 적용 함수
function applyOverlayIfApplied(jobCard, appliedJobIds) {
  const positionId = jobCard.getAttribute("data-position-id");

  if (appliedJobIds.includes(positionId)) {
    const imageContainer = jobCard.querySelector("img");

    if (imageContainer && !jobCard.querySelector(".applied-overlay")) {
      imageContainer.style.filter = "blur(4px)";

      // 오버레이 요소 생성
      const overlay = document.createElement("div");
      overlay.className = "applied-overlay"; // 중복 방지용 클래스

      // 오버레이 스타일 설정
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.textAlign = "center"; // 가운데 정렬
      overlay.style.color = "white";
      overlay.style.fontSize = "18px";
      overlay.style.fontWeight = "bold";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

      // 텍스트 추가
      overlay.innerHTML = "이미 지원한<br>공고입니다.";
      imageContainer.parentElement.style.position = "relative";
      imageContainer.parentElement.appendChild(overlay);
      // console.log("Overlay applied to jobCard with positionId:", positionId);
    }
  }
}

// 초기 실행: 저장된 데이터로 모든 공고 카드에 오버레이 적용
applySavedJobsOverlay();

// DOM 변화를 감지하여 추가된 공고 카드 처리
observeDOMChanges();
