const baseURL = window.location.origin;

// 도메인에 따라 적절한 스크립트를 로드
if (baseURL.includes("wanted.co.kr")) {
  import(chrome.runtime.getURL("/domains/wanted.js")).then((module) => {
    module.handlePage();
  });
}
// else if (baseURL.includes("otherdomain.com")) {
//   import(chrome.runtime.getURL("/domains/otherDomain.js")).then((module) => {
//     module.handlePage();
//   });
// }
