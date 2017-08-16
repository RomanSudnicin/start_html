var url = location.pathname.split("/");
var href = $('.header__item a');
var developmentColumn = $('.development__column')

$(document).ready(function () {
  href.each(function () {
    if ($(this).attr('href')  === url[1]) {
      $(this).parent().addClass('active');
    }
  });
});

developmentColumn.on('mouseenter', function () {
  developmentColumn.removeClass('active');
  $(this).addClass('active');
});

developmentColumn.on('mouseleave', function () {
  $(this).removeClass('active');
});

$(document).ready(function() {
  $('.header__nav').prepend("<div class='burger'><span></span><span></span><span></span><span></span><span></span><span></span></div>");
  $('.burger').click(function () {
    $(this).toggleClass('open');
    $(this).siblings('.header__items').toggleClass('show');
  });
});
