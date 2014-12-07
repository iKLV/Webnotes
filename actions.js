var URL = localStorage['URL'];

function printMessage(message) {
    $("#Message").html(chrome.i18n.getMessage(message));
    $("#Loading").fadeOut('slow');
    $("#Message").fadeIn('fast')
    if (message != 'error_connection') $("#Message").delay(1000).fadeOut('slow');
};

function create1Note(id, content) {
    var note = document.createElement('div');
    note.className = 'Note';
    note.style.display = 'none';
    note.contentEditable = true;
    if (id) note.id = id;
    content = content.split('\n');
    for (var c=0; c < content.length; c++) $(note).append(content[c]+'<br>');
    $(note).blur(function() {
        $("#Loading").fadeIn("fast");
        var cont = this.innerHTML.split('<br>');
        for (var i=cont.length-1; i>0; i--) {
            if (cont[i] == '') cont.splice(i,1);
            else break;
        }
        cont = cont.join('\n')
        if (cont == "") {
            $(this).slideUp();
            Notes.delete1Note(this);
        } else Notes.save1Note(this,cont);
    });
    $('body').append(note);
    $(note).slideDown();
    return note;
};

var Notes = {
    requestNotes: function() {
        $.ajax({
            type: 'GET',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes",
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (notes) {
                for (var n in notes) create1Note(notes[n]['id'],notes[n]['content']);
                printMessage("welcome");
            },
            error: function () {
                $("#NewNote").hide();
                printMessage("error_connection");
            },
            timeout: 3000,
            /*beforeSend: function (xhr) {
                var auth = btoa(login + ':' + password);
                xhr.setRequestHeader('Authorization', 'Basic ' + auth);
            }*/
        });
    },
	save1Note: function(note, content) {
	    $.ajax({
            type: 'PUT',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+note.id+'?content='+encodeURIComponent(content),
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function () {
                printMessage("note_saved");
            },
            error: function () {
                printMessage("error");
            },
            /*beforeSend: function (xhr) {
                var auth = btoa(login + ':' + password);
                xhr.setRequestHeader('Authorization', 'Basic ' + auth);
            }*/
        });
	},
    add1Note: function(note) {
        $.ajax({
            type: 'POST',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes",
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (newnote) {
                note.id = newnote['id'];
                printMessage("new_note_added");
            },
            error: function () {
                note.slideUp();
                printMessage("error");
            },
            /*beforeSend: function (xhr) {
                var auth = btoa(login + ':' + password);
                xhr.setRequestHeader('Authorization', 'Basic ' + auth);
            }*/
        });
    },
    delete1Note: function(note) {
        $.ajax({
        type: 'DELETE',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+note.id,
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function () {
                printMessage("note_deleted");
            },
            error: function () {
                $(note).slideDown();
                printMessage("error");
            },
            /*beforeSend: function (xhr) {
                var auth = btoa(login + ':' + password);
                xhr.setRequestHeader('Authorization', 'Basic ' + auth);
            }*/
        });
    },
};

document.addEventListener('DOMContentLoaded', function () {
    // Check parameters
    if (!URL) window.location.replace("options.html");

    // Request the current notes
    Notes.requestNotes();

    // Header
    $('#header').fadeIn('slow');
    $("#Loading").fadeIn("fast");
    $("#NewNote").hover(function() {
            $("#Message").html(chrome.i18n.getMessage("add_new_note"));
            $("#Message").fadeIn("fast");
        },
        function() {
            $("#Message").fadeOut("fast");
    });
    $("#NewNote").click(function() {
        var note = create1Note(null,'');
        note.focus();
        Notes.add1Note(note);
    });
    /*$('body').bind('keypress', function(e) {
        if (e.ctrlKey && e.which == 78) {
            console.log('t');
            e.preventDefault();
            var note = create1Note(null,'');
            note.focus();
            Notes.add1Note(note);
        }
    });*/
});
