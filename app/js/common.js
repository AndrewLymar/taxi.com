$(function () {
	$('.reviews-slider').slick({
		autoplay: true,
		arrows: false,
		slidesToShow: 2,
		dots: false,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 1,
				}
    		}
  		]
	});
	$('.menu').mobileMenu({
		menuIconClassName: ".menu__icon",
		mobileResolution: 768,
		menuType: "sticky",
		offsetToSticky: 50,
		closeIconClassName: ""
	});
});
