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
    note.changed = false;
    if (id) note.id = id;
    content = content.split('\n');
    for (var c=0; c < content.length; c++) $(note).append(content[c]+'<br>');
    // blur event to send a save or delete
    $(note).blur(function() {
        var cont = this.innerHTML.replace(/<br>/g,"\n");
        for (var i=cont.length-1; i>0; i--) {
            if (cont[i] != '\n') {
                cont = cont.slice(0, i+1);
                break;
            }
        }
        if (cont == "" || cont == "\n") {
            $("#Loading").fadeIn("fast");
            $(this).slideUp();
            Notes.delete1Note(this);
        } else if (note.changed) {
            $("#Loading").fadeIn("fast");
            Notes.save1Note(this,cont);
        }
    });
    // detects the changes
    $(note).keypress(function() {
        note.changed = true;
    });
    // shit + s
    $(note).keypress(function(e) {
        if (e.shiftKey && e.which == 83) {
            e.preventDefault();
            $(this).blur();
        }
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
                note.changed = false;
                printMessage("note_saved");
            },
            error: function () {
                printMessage("error");
            },
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
    $('body').keypress(function(e) {
        if (e.shiftKey && e.which == 78) {
            e.preventDefault();
            $("#NewNote").click();
        }
    });
});
