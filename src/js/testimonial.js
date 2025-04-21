/**
 * @name testimonial carousel
 * @function handle carousel tag
 */

$(function() {
  var $carousel = $('#testimonial-carousel');
  // Handle carousel tag
  $carousel.slick({
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 7000,
    slidesToShow: 3,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
  
  // Handle slick navigation
  $('#prev_testi').click(function() {
    $carousel.slick('slickPrev');
  });
  $('#next_testi').click(function() {
    $carousel.slick('slickNext');
  });
});