document.addEventListener('DOMContentLoaded', function () {
    if (localStorage['URL']) {
        $("#URL").val(localStorage['URL']);
    } else {
		$("#URL").val("https://");
	};
    if (localStorage['Login']) {
        $("#Login").val(localStorage['Login']);
    };
    if (localStorage['Password']) {
        $("#Password").val(localStorage['Password']);
    };

    $("#OptionForm").submit(function() {
		localStorage['URL'] = document.getElementById('URL').value;
		localStorage['Login'] = document.getElementById('Login').value;
		localStorage['Password'] = document.getElementById('Password').value;
        $("#OptionMessage").html(chrome.i18n.getMessage("parameters_saved") + "<a href='popup.html'>Ownotes</a>.");
        
        event.preventDefault();
    });
    $("#Clear").click(function() {
        localStorage.clear();
        $("#URL").val('https://');
		$("#URL").focus();
        $("#Login").val('');
        $("#Password").val('');
        $("#OptionMessage").html(chrome.i18n.getMessage("parameters_deleted"));
    });
	$("#Title").html(chrome.i18n.getMessage("title_option"));
	$("#labelURL").html(chrome.i18n.getMessage("label_URL"));
	$("#labelLogin").html(chrome.i18n.getMessage("label_Login"));
	$("#labelPassword").html(chrome.i18n.getMessage("label_Password"));
	$("#Save").val(chrome.i18n.getMessage("save_options"));
	$("#Clear").val(chrome.i18n.getMessage("clear_options"));
});
