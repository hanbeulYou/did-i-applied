import { saveJobPosting } from "../storage.js"; // 저장 로직을 공통 파일로 분리

export function handlePage() {
  document.addEventListener("click", (e) => {
    const companyLink = e.target.closest(
      "[data-attribute-id='company__click']"
    );
    console.log("companyLink:", companyLink); // 클릭된 회사 링크 확인
    if (companyLink) {
      const companyLogo = companyLink.querySelector("img")?.src || ""; // 로고 이미지 URL 가져오기

      const companyData = {
        companyId: companyLink.getAttribute("data-company-id"),
        companyName: companyLink.getAttribute("data-company-name"),
        positionId: companyLink.getAttribute("data-position-id"),
        positionName: companyLink.getAttribute("data-position-name"),
        logoUrl: companyLogo, // 로고 URL 저장
      };

      console.log("companyData:", companyData); // 저장할 데이터 확인
      saveJobPosting(companyData, "Wanted");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["savedJobs"], (result) => {
      const savedJobs = result.savedJobs || {};
      const appliedJobIds = savedJobs["Wanted"]
        ? savedJobs["Wanted"].map((job) => job.positionId)
        : [];

      console.log("savedJobs:", savedJobs); // 저장된 전체 데이터 확인
      console.log("appliedJobIds:", appliedJobIds); // 지원한 포지션 ID 목록 확인

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === 1 &&
              node.matches("a[data-attribute-id='position__click']")
            ) {
              console.log("New jobCard added:", node); // 새로 추가된 공고 카드 확인
              applyOverlayIfApplied(node, appliedJobIds);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      document
        .querySelectorAll("a[data-attribute-id='position__click']")
        .forEach((jobCard) => {
          console.log("Applying overlay to existing jobCard:", jobCard); // 기존 공고 카드 확인
          applyOverlayIfApplied(jobCard, appliedJobIds);
        });
    });
  });
}

// 공고 카드에 오버레이 적용하는 함수
function applyOverlayIfApplied(jobCard, appliedJobIds) {
  const positionId = jobCard.getAttribute("data-position-id");
  console.log("Checking positionId for overlay:", positionId); // 오버레이 적용 대상 확인

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
      console.log("Overlay applied to jobCard with positionId:", positionId); // 오버레이 적용 완료 확인
    }
  }
}
