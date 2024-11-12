import { saveJobPosting } from "../storage.js"; // 저장 로직을 공통 파일로 분리

export function handlePage() {
  document.addEventListener("click", (e) => {
    const companyLink = e.target.closest(
      "[data-attribute-id='company__click']"
    );
    console.log("companyLink", companyLink);
    if (companyLink) {
      const companyData = {
        companyId: companyLink.getAttribute("data-company-id"),
        companyName: companyLink.getAttribute("data-company-name"),
        positionId: companyLink.getAttribute("data-position-id"),
        positionName: companyLink.getAttribute("data-position-name"),
      };
      console.log("companyData", companyData);
      saveJobPosting(companyData, "Wanted");
    }
  });
}
