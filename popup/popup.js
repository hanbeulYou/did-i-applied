document.addEventListener("DOMContentLoaded", () => {
  const wantedCategory = document.getElementById("wantedCategory");
  const jobList = document.getElementById("jobList");

  // 카테고리 클릭 시 토글
  wantedCategory.addEventListener("click", () => {
    // 토글 기능: jobList가 보이거나 숨기기
    if (jobList.style.display === "none" || jobList.style.display === "") {
      jobList.style.display = "block";
      loadJobList();
    } else {
      jobList.style.display = "none";
      jobList.innerHTML = ""; // 숨길 때 기존 리스트 초기화
    }
  });

  // jobList를 로드하는 함수
  function loadJobList() {
    chrome.storage.local.get(["savedJobs"], (result) => {
      const savedJobs = result.savedJobs || {};
      const wantedJobs = savedJobs["Wanted"] || [];

      wantedJobs.forEach((job) => {
        const jobItem = document.createElement("li");

        // 이미지, 회사명, 포지션 정보 엘리먼트 생성
        const jobLogo = document.createElement("img");
        jobLogo.src = job.logoUrl; // 로고 URL
        jobLogo.alt = `${job.companyName} Logo`;
        jobLogo.classList.add("job-logo");

        const jobDetails = document.createElement("div");
        jobDetails.classList.add("job-details");

        const companyName = document.createElement("span");
        companyName.textContent = job.companyName;

        const positionName = document.createElement("span");
        positionName.textContent = job.positionName;

        jobDetails.appendChild(companyName);
        jobDetails.appendChild(positionName);

        jobItem.appendChild(jobLogo);
        jobItem.appendChild(jobDetails);

        // 클릭 시 positionId로 페이지 이동
        jobItem.addEventListener("click", () => {
          window.open(
            `https://www.wanted.co.kr/wd/${job.positionId}`,
            "_blank"
          );
        });

        jobList.appendChild(jobItem);
      });
    });
  }
});
