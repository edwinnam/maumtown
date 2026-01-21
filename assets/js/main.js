import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDg7pRFz4g4Yznnf-cOrIAS-avflcybfdk",
  authDomain: "ibpi-ec115.firebaseapp.com",
  projectId: "ibpi-ec115",
  storageBucket: "ibpi-ec115.appspot.com",
  messagingSenderId: "174907185993",
  appId: "1:174907185993:web:9aacd03b5d402d43801898",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // 익명 인증
    signInAnonymously(auth).catch((error) => {
      console.error("Authentication error: ", error);
    });

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
      contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value;

        document.querySelector(".loading").style.display = "block";
        document.querySelector(".sent-message").style.display = "none";
        document.querySelector(".error-message").style.display = "none";

        try {
          const docRef = await addDoc(collection(db, "maumtown"), {
            name: name,
            phone: phone,
            subject: subject,
            message: message,
            timestamp: new Date(),
          });

          document.querySelector(".sent-message").style.display = "block";
          contactForm.reset();

          setTimeout(() => {
            document.querySelector(".sent-message").style.display = "none";
          }, 2000);
        } catch (error) {
          document.querySelector(".error-message").textContent = error.message;
          document.querySelector(".error-message").style.display = "block";
        } finally {
          document.querySelector(".loading").style.display = "none";
        }
      });
    }

    // Initialize the carousel and start auto-cycling
    var myCarousel = document.querySelector("#carouselExampleIndicators");

    if (myCarousel) {
      var carousel = new bootstrap.Carousel(myCarousel, {
        interval: 8000,
        wrap: true,
        touch: true,
      });

      // Custom Previous and Next button actions
      var carouselPrev = document.querySelector(
        '[href="#carouselExample2Controls"][role="button"][data-slide="prev"]'
      );
      var carouselNext = document.querySelector(
        '[href="#carouselExample2Controls"][role="button"][data-slide="next"]'
      );

      if (carouselPrev && carouselNext) {
        carouselPrev.addEventListener("click", function () {
          carousel.prev();
        });

        carouselNext.addEventListener("click", function () {
          carousel.next();
        });
      }
    }

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

    const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
    const navbar = document.getElementById("navbar");

    // 모바일 네비게이션 토글
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener("click", function (e) {
        e.stopPropagation(); // 이벤트 전파 중지
        navbar.classList.toggle("navbar-mobile");
        this.classList.toggle("bi-list");
        this.classList.toggle("bi-x");
      });
    }

    // 드롭다운 메뉴 토글
    const dropdownLinks = document.querySelectorAll(".navbar .dropdown > a");

    dropdownLinks.forEach(function (dropdownLink) {
      dropdownLink.addEventListener("click", function (e) {
        if (navbar.classList.contains("navbar-mobile")) {
          e.preventDefault();
          e.stopPropagation(); // 이벤트 전파 중지
          const dropdownMenu = this.nextElementSibling;

          dropdownLinks.forEach((link) => {
            if (link !== dropdownLink) {
              link.nextElementSibling.classList.remove("dropdown-active");
              link.nextElementSibling.style.display = "none";
            }
          });

          if (dropdownMenu.style.display === "block") {
            dropdownMenu.style.display = "none";
          } else {
            dropdownMenu.style.display = "block";
          }

          dropdownMenu.classList.toggle("dropdown-active");
          console.log(`Dropdown menu for ${this.innerText} toggled.`);
        }
      });
    });

    // 초기 설정: 모든 드롭다운 숨기기
    const dropdowns = document.querySelectorAll(".navbar .dropdown ul");
    dropdowns.forEach(function (dropdown) {
      dropdown.style.display = "none";
    });

    // 각 링크 클릭 이벤트 추가
    const links = document.querySelectorAll(".navbar a");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.stopPropagation(); // 이벤트 전파 중지
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          mobileNavToggle.classList.toggle("bi-list");
          mobileNavToggle.classList.toggle("bi-x");
        }
      });
    });

    // Navbar links active state on scroll
    const navbarlinks = document.querySelectorAll("#navbar .scrollto");
    const navbarlinksActive = () => {
      const position = window.scrollY + 200;
      navbarlinks.forEach((navbarlink) => {
        if (!navbarlink.hash) return;
        const section = document.querySelector(navbarlink.hash);
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
    window.addEventListener("scroll", navbarlinksActive);

    // Scroll with offset on links with a class name .scrollto
    document.querySelectorAll(".scrollto").forEach(function (scrollLink) {
      scrollLink.addEventListener("click", function (e) {
        e.stopPropagation(); // 이벤트 전파 중지
        if (document.querySelector(this.hash)) {
          e.preventDefault();

          if (
            document
              .getElementById("navbar")
              .classList.contains("navbar-mobile")
          ) {
            document.getElementById("navbar").classList.remove("navbar-mobile");
            const navbarToggle = document.querySelector(".mobile-nav-toggle");
            navbarToggle.classList.toggle("bi-list");
            navbarToggle.classList.toggle("bi-x");
          }
          scrollto(this.hash);
        }
      });
    });

    // 초기 상태 확인을 위한 로그 출력
    console.log("DOMContentLoaded event fired. All event listeners are set.");

    // 기타 DOMContentLoaded 이벤트 핸들러
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
    var mainMenuItems = document.querySelectorAll(".navbar > ul > li");
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

  function scrollto(el) {
    const element = document.querySelector(el);
    const offset = document.querySelector("#header").offsetHeight;

    const elementPos = element.offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  }

  /**
   * Mobile nav toggle
   */
  document
    .querySelector(".mobile-nav-toggle")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      document.getElementById("navbar").classList.toggle("navbar-mobile");
      this.classList.toggle("bi-list");
      this.classList.toggle("bi-x");
    });

  /**
   * Mobile nav dropdowns activate
   */
  document
    .querySelectorAll(".navbar .dropdown > a")
    .forEach(function (dropdownLink) {
      dropdownLink.addEventListener("click", function (e) {
        if (
          document.getElementById("navbar").classList.contains("navbar-mobile")
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.nextElementSibling.classList.toggle("dropdown-active");
          $(this).next("ul").slideToggle();
          $(this).parent().siblings().find("ul").slideUp();
        }
      });
    });

  /**
   * Scroll with offset on links with a class name .scrollto
   */
  document.querySelectorAll(".scrollto").forEach(function (scrollLink) {
    scrollLink.addEventListener("click", function (e) {
      if (document.querySelector(this.hash)) {
        e.preventDefault();
        e.stopPropagation();

        let navbar = document.getElementById("navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = document.querySelector(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    });
  });

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Hero carousel indicators
   */
  let heroCarouselIndicators = document.querySelector(
    "#hero-carousel-indicators"
  );
  let heroCarouselItems = document.querySelectorAll(
    "#heroCarousel .carousel-item"
  );

  heroCarouselItems.forEach((item, index) => {
    index === 0
      ? (heroCarouselIndicators.innerHTML +=
          "<li data-bs-target='#heroCarousel' data-bs-slide-to='" +
          index +
          "' class='active'></li>")
      : (heroCarouselIndicators.innerHTML +=
          "<li data-bs-target='#heroCarousel' data-bs-slide-to='" +
          index +
          "'></li>");
  });

  /**
   * Team Slider
   */
  new Swiper(".clients-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: 4, // 한 번에 보이는 슬라이드 수를 4으로 설정
    spaceBetween: 30, // 이미지 사이의 간격
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 2, // 작은 화면에서는 한 번에 하나의 이미지만 보이도록 설정
        spaceBetween: 10,
      },
      640: {
        slidesPerView: 2, // 중간 크기의 화면에서는 두 개의 이미지 보이도록 설정
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 4, // 큰 화면에서는 세 개의 이미지 보이도록 설정
        spaceBetween: 30,
      },
    },
  });

  //Testimony width와 height 조정
  document.addEventListener("DOMContentLoaded", function () {
    const clientBoxes = document.querySelectorAll(".client_box .detail");

    clientBoxes.forEach((detailBox) => {
      // 원래 내용 저장
      const originalContent = detailBox.innerHTML;
      const truncatedContent =
        originalContent.substring(0, 600) +
        '<span class="read-more-btn"> 더보기</span>';

      // 초기 내용 설정
      detailBox.innerHTML = truncatedContent;

      // 더보기 버튼 클릭 이벤트
      detailBox.addEventListener("click", function (e) {
        if (e.target.classList.contains("read-more-btn")) {
          const clientBox = detailBox.closest(".client_box");
          if (clientBox.classList.contains("expanded")) {
            detailBox.innerHTML = truncatedContent;
            clientBox.classList.remove("expanded");
          } else {
            detailBox.innerHTML =
              originalContent + '<span class="read-more-btn"> 닫기</span>';
            clientBox.classList.add("expanded");
          }
        }
      });
    });
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener("load", () => {
    let portfolioContainer = document.querySelector(".portfolio-container");
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
      });

      let portfolioFilters = document.querySelectorAll("#portfolio-flters li");

      portfolioFilters.forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
        });
      });
    }
  });

  /**
   * Initiate portfolio lightbox
   */
  const portfolioLightbox = GLightbox({
    selector: ".portfolio-lightbox",
  });

  /**
   * Portfolio details slider
   */
  new Swiper(".portfolio-details-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  });

  $(document).ready(function () {
    // 모바일 네비게이션 토글
    $(".mobile-nav-toggle").on("click", function () {
      $(".navbar").toggleClass("navbar-mobile");
      $(this).toggleClass("bi-list bi-x");
    });

    // 드롭다운 메뉴 토글
    $(".navbar .dropdown > a").on("click", function (e) {
      if ($(".navbar").hasClass("navbar-mobile")) {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 전파 중지
        $(this).next("ul").slideToggle();
        $(this).parent().siblings().find("ul").slideUp();
      }
    });

    // 하위 메뉴 클릭 시 상위 메뉴 닫기
    $(".navbar .dropdown ul li a").on("click", function () {
      if ($(".navbar").hasClass("navbar-mobile")) {
        $(".navbar").removeClass("navbar-mobile");
        $(".mobile-nav-toggle").toggleClass("bi-list bi-x");
        $(".navbar .dropdown ul").slideUp();
      }
    });
  });

  // // JavaScript 코드 삽입
  // document.addEventListener("DOMContentLoaded", function () {
  //   // Kakao SDK 초기화
  //   Kakao.init("31b703734ba796fcec3cedbb8ac4ef0e");

  //   // 카카오톡 링크 버튼 클릭 이벤트
  //   document
  //     .getElementById("kakao-link-btn")
  //     .addEventListener("click", function () {
  //       Kakao.Link.sendDefault({
  //         objectType: "feed",
  //         content: {
  //           title: "마음동네심리상담센터",
  //           description: "행복한 마음을 선물로 얻는 곳",
  //           imageUrl: "https://maumtown.kr/assets/img/images/maumtownlogo.png", // 썸네일 이미지 URL을 입력합니다.
  //           link: {
  //             mobileWebUrl: "https://maumtown.kr",
  //             webUrl: "https://maumtown.kr",
  //           },
  //         },
  //         buttons: [
  //           {
  //             title: "웹으로 보기",
  //             link: {
  //               mobileWebUrl: "https://maumtown.kr",
  //               webUrl: "https://maumtown.kr",
  //             },
  //           },
  //           {
  //             title: "앱으로 보기",
  //             link: {
  //               mobileWebUrl: "https://maumtown.kr",
  //               webUrl: "https://maumtown.kr",
  //             },
  //           },
  //         ],
  //       });
  //     });
  // });
})();
