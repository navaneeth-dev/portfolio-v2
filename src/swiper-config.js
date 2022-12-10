import Swiper, { Navigation, EffectCoverflow, Autoplay } from "swiper";
const swiper = new Swiper(".swiper", {
  modules: [Navigation, EffectCoverflow, Autoplay],
  effect: "coverflow",
  loop: true,
  autoplay: {
    delay: 2000,
  },
  slidesPerView: 1,
  spaceBetween: 50,
  speed: 700,
  centeredSlides: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
    },
  },
});
