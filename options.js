document.addEventListener('DOMContentLoaded', function () {
    if (localStorage['URL']) $("#URL").val(localStorage['URL']);
	else $("#URL").val("https://");

    $("#OptionForm").submit(function() {
        var URL = $('#URL').val();
        localStorage['URL'] = URL;
        var Login = $('#Login').val();
        var Password = $('#Password').val();
        event.preventDefault();

        $.ajax({
            type: 'GET',
            url: URL + "/index.php/apps/notes/api/v0.2/notes",
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (notes) {
                $("#OptionMessage").html(chrome.i18n.getMessage("connection_success") + "<a href='popup.html'>Ownotes</a>.");
            },
            error: function () {
                $("#OptionMessage").html(chrome.i18n.getMessage("connection_fail"));
            },
            beforeSend: function (xhr) {
                var auth = btoa(Login + ':' + Password);
                xhr.setRequestHeader('Authorization', 'Basic ' + auth);
            }
        }); 
    });
    $("#Clear").click(function() {
        localStorage.clear();
        $("#URL").val('https://');
		$("#URL").focus();
        $("#Login").val('');
        $("#Password").val('');
        $("#OptionMessage").html(chrome.i18n.getMessage("clear_parameters"));
    });
	$("#Title").html(chrome.i18n.getMessage("title_option"));
	$("#labelURL").html(chrome.i18n.getMessage("label_URL"));
	$("#labelLogin").html(chrome.i18n.getMessage("label_Login"));
	$("#labelPassword").html(chrome.i18n.getMessage("label_Password"));
	$("#Save").val(chrome.i18n.getMessage("save_options"));
	$("#Clear").val(chrome.i18n.getMessage("clear_options"));
    $("#Hint").val(chrome.i18n.getMessage("hint"));
});
