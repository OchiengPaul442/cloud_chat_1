$("#search_field").on("keyup", function () {
  var value = $(this).val();
  var patt = new RegExp(value, "i");

  $(".active_users").each(function () {
    var name = $(this).find(".name").text();
    if (patt.test(name)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
});
