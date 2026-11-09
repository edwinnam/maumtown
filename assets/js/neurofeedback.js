(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };

  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  document.addEventListener("DOMContentLoaded", function () {
    var dropdowns = document.querySelectorAll(".navbar .dropdown ul");
    var mainMenuItems = document.querySelectorAll(".navbar > ul > li");
    var dropdownBackground = document.getElementById("dropdown-background");
    var isDropdownVisible = false;
    var hideTimeout;

    // 모든 드롭다운 메뉴의 높이를 동일하게 맞추는 함수
    function setDropdownHeights() {
      var maxHeight = 0;

      // 각 드롭다운 메뉴의 높이를 계산하여 최대 높이 찾기
      dropdowns.forEach(function (dropdown) {
        var originalDisplay = dropdown.style.display;
        var originalVisibility = dropdown.style.visibility;
        var originalPosition = dropdown.style.position;

        dropdown.style.display = "block";
        dropdown.style.visibility = "hidden";
        dropdown.style.position = "absolute";

        var height = dropdown.scrollHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }

        dropdown.style.display = originalDisplay;
        dropdown.style.visibility = originalVisibility;
        dropdown.style.position = originalPosition;
      });

      // 모든 드롭다운 메뉴의 높이를 최대 높이로 설정
      dropdowns.forEach(function (dropdown) {
        dropdown.style.height = maxHeight + "px";
      });

      // 배경 높이 설정
      if (dropdownBackground) {
        dropdownBackground.style.height = maxHeight + "px";
      }
    }

    // 드롭다운 메뉴를 모두 보이게 설정
    function showDropdowns() {
      setDropdownHeights();
      dropdowns.forEach(function (dropdown) {
        dropdown.style.display = "block";
      });
      if (dropdownBackground) {
        dropdownBackground.style.display = "block";
      }
      isDropdownVisible = true;
    }

    // 드롭다운 메뉴를 모두 숨기게 설정
    function hideDropdowns() {
      dropdowns.forEach(function (dropdown) {
        dropdown.style.display = "none";
      });
      if (dropdownBackground) {
        dropdownBackground.style.display = "none";
      }
      isDropdownVisible = false;
    }

    // 메인 메뉴 아이템에 마우스 엔터 이벤트 추가
    mainMenuItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        showDropdowns();
        clearTimeout(hideTimeout);
      });

      item.addEventListener("mouseleave", function (event) {
        hideTimeout = setTimeout(function () {
          if (
            !item.contains(event.relatedTarget) &&
            !dropdownBackground.contains(event.relatedTarget)
          ) {
            hideDropdowns();
          }
        }, 300);
      });
    });

    // 배경에 마우스 리브 이벤트 추가
    if (dropdownBackground) {
      dropdownBackground.addEventListener("mouseleave", function (event) {
        hideTimeout = setTimeout(function () {
          if (!dropdownBackground.contains(event.relatedTarget)) {
            hideDropdowns();
          }
        }, 300);
      });

      // 배경에 마우스 엔터 이벤트 추가 (사라지지 않도록)
      dropdownBackground.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
      });
    }

    // 페이지 로드 시 드롭다운 높이 설정 및 초기화
    setDropdownHeights();
    hideDropdowns();

    // 스크롤 이벤트 추가
    window.addEventListener("scroll", function () {
      if (isDropdownVisible) {
        hideDropdowns();
      }
    });
  });

  /**
   * Mobile nav toggle
   */
  on("click", ".mobile-nav-toggle", function (e) {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");

    var dropdownBackground = document.getElementById("dropdown-background");
    if (dropdownBackground) {
      dropdownBackground.style.display = "none";
    }
  });

  /**
   * Mobile nav dropdowns activate
   */
  on(
    "click",
    ".navbar .dropdown > a",
    function (e) {
      if (select("#navbar").classList.contains("navbar-mobile")) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle("dropdown-active");
        var dropdownBackground = document.getElementById("dropdown-background");
        if (dropdownBackground) {
          dropdownBackground.style.display = "none";
        }
      }
    },
    true
  );

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select("#navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );
})();
