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

  /**
   * Hero carousel indicators
   */
  document.addEventListener("DOMContentLoaded", (event) => {
    setupSection(".section-one");
    setupSection(".section-two");
  });

  function setupSection(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    const selectedColors = new Set();
    const captureButton = document.getElementById("capture-btn");
    const circles = section.querySelectorAll(".circle");
    const colorOptionsContainer = section.querySelector(".color-options");
    const colorOptions = section.querySelectorAll(".color-option");
    let lastSelectedCircleIndex = 0;

    circles.forEach((circle, index) => {
      circle.addEventListener("click", function () {
        colorOptionsContainer.style.display = "flex";
        lastSelectedCircleIndex = index;
        circles.forEach((c) => c.classList.remove("active"));
        this.classList.add("active");
      });
    });
    captureButton.style.display = "none";
    colorOptions.forEach((option) => {
      if (option.getAttribute("data-color") === "치어") {
        option.style.color = "black";
      }
      option.addEventListener("click", function () {
        const colorName = this.getAttribute("data-color");
        const colorValue = this.style.backgroundColor;
        let selectedCircle = circles[lastSelectedCircleIndex];

        if (!selectedCircle.classList.contains("active")) {
          lastSelectedCircleIndex =
            (lastSelectedCircleIndex + 1) % circles.length;
          selectedCircle = circles[lastSelectedCircleIndex];
        }

        applyColorToCircle(selectedCircle, colorName, colorValue);
        this.style.display = "none";
        selectedColors.add(colorName);

        if (selectedColors.size === colorOptions.length) {
          captureButton.style.display = "block";
        }
      });
    });

    const resetButton = section.querySelector(".reset-selection");
    resetButton.addEventListener("click", () => {
      circles.forEach((circle) => {
        circle.style.backgroundColor = "";
        circle.textContent = "누르세요";
        circle.style.color = "black";
        circle.style.borderColor = "black";
        captureButton.style.display = "none";
      });

      colorOptionsContainer.style.display = "none";
      colorOptions.forEach((option) => (option.style.display = "block"));
    });
  }

  function applyColorToCircle(circle, colorName, colorValue) {
    if (colorName === "시트러스 블리스") {
      circle.innerHTML = "시트러스<br>블리스";
    } else {
      circle.textContent = colorName;
    }
    circle.style.backgroundColor = colorValue;
    circle.style.borderColor = colorValue;
    circle.style.color =
      colorValue === "rgb(217, 214, 57)" || colorValue === "rgb(242, 199, 8)"
        ? "black"
        : "white";
    circle.classList.remove("active");
    circle.style.fontWeight = "bold";
  }

  document.addEventListener("DOMContentLoaded", (event) => {
    const usageButton = document.querySelector(".usage");
    const usageDescription = document.querySelector(".usage-description");

    usageButton.addEventListener("click", function () {
      usageDescription.style.display =
        usageDescription.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", function (e) {
      if (
        !e.target.closest(".usage") &&
        !e.target.closest(".usage-description")
      ) {
        usageDescription.style.display = "none";
      }
    });
  });

  document.getElementById("capture-btn").addEventListener("click", function () {
    // 기타 버튼 숨기기
    document
      .querySelectorAll(".reset-selection, .usage")
      .forEach((btn) => (btn.style.display = "none"));

    // 텍스트 변경
    const h5Element = document.querySelector(".section-one .hero-container h5");
    const originalH5Text = h5Element.textContent;
    h5Element.textContent = "오늘의 내 기분과 감정";

    const sectionOneH6 = document.querySelector(
      ".section-one .hero-container h6"
    );
    const originalSectionOneH6Text = sectionOneH6.textContent;
    sectionOneH6.textContent = "좋아하는 기분오일 순서";

    const sectionTwoH6 = document.querySelector(
      ".section-two .hero-container h6"
    );
    const originalSectionTwoH6Text = sectionTwoH6.textContent;
    sectionTwoH6.textContent = "좋아하는 감정오일 순서";

    const combinedSection = document.getElementById("oil-selection-combined");
    combinedSection.style.border = "1px solid rgb(0, 0, 0)";

    // 캡쳐 및 팝업 표시
    html2canvas(combinedSection, {
      scale: 2,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    }).then((canvas) => {
      combinedSection.style.border = "none";

      // 텍스트 복원
      h5Element.textContent = originalH5Text;
      sectionOneH6.textContent = originalSectionOneH6Text;
      sectionTwoH6.textContent = originalSectionTwoH6Text;

      let screenWidth =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      let popupWidth, popupHeight;
      if (screenWidth <= 768) {
        // 스마트폰 화면 크기로 가정
        popupWidth = 600;
        popupHeight = 500;
      } else {
        // PC 화면 크기로 가정
        popupWidth = 800;
        popupHeight = 600;
      }

      // 팝업 창 생성 및 이미지 및 버튼 표시
      let popupWindow = window.open(
        "",
        "Captured Image",
        `width=${popupWidth},height=${popupHeight}`
      );
      popupWindow.document.write(`
        <html>
          <head>
            <title>Captured Selection</title>
            <style>
              body { text-align: center; font-family: Arial, sans-serif; }
              .button { margin-top: 10px; padding: 16px 36px; border: none; font-size: 20px; background-color: #efefef; cursor: pointer; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL(
              "image/png"
            )}" width="80%" height="auto">
            <div id="button-container">
              <button class="button" id="popup-download" onclick="downloadImage()">확인</button>
              <button class="button" onclick="window.close()">취소</button>
            </div>
            <script>
              function downloadImage() {
                let now = new Date();
                let filename = 'Oil-Selection_' + now.getFullYear().toString().substr(-2) + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) + ('0' + now.getHours()).slice(-2) + ('0' + now.getMinutes()).slice(-2) + '.png';
                let link = document.createElement("a");
                link.download = filename;
                link.href = "${canvas.toDataURL("image/png")}";
                link.click();
              }
            </script>
          </body>
        </html>
      `);

      // 기타 버튼 다시 표시
      document
        .querySelectorAll(".reset-selection, .usage")
        .forEach((btn) => (btn.style.display = "block"));
    });
  });

  document
    .getElementById("download-captured-image")
    .addEventListener("click", function () {
      const image = document.getElementById("captured-image").src;
      let link = document.createElement("a");
      link.download = "oil-selection.png";
      link.href = image;
      link.click();
      document.getElementById("popup-container").style.display = "none";
    });

  document.getElementById("close-popup").addEventListener("click", function () {
    document.getElementById("popup-container").style.display = "none";
  });

  document.addEventListener("DOMContentLoaded", function () {
    const currentDateElement = document.getElementById("current-date-time");
    const now = new Date();
    const formattedDate =
      now.getFullYear() +
      "년 " +
      (now.getMonth() + 1) +
      "월 " +
      now.getDate() +
      "일 " +
      now.getHours() +
      "시 " +
      now.getMinutes() +
      "분";

    currentDateElement.textContent = formattedDate;
  });
})();
