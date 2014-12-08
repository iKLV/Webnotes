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
    note.contentEditable = true;
    note.changed = false;
    if (id) note.id = id;
    content = content.split('\n');
    for (var c=0; c < content.length; c++) $(note).append(content[c]+'<br>');
    note.save = document.createElement('img');
    note.save.src = "images/saved.png";
    note.save.className = "saved";
    note.save.contentEditable = false;
    // blur event to send a save or delete
    $(note).blur(function() {
        var cont = this.innerHTML.split('<br>');
        var len = cont.length;
        for (var i=1; i<=len; i++) {
            if (cont[len-i] != '') break;
            cont.splice(-1, 1);
        }
        this.innerHTML = cont.join('<br>');
        cont = cont.join('\n');
        if (cont == "") {
            $("#Loading").fadeIn("fast");
            $(this).slideUp('slow');
            $(this.save).slideUp('slow');
            Notes.delete1Note(this);
        } else if (note.changed) {
            //$("#Loading").fadeIn("fast");
            note.save.src = "images/loader.gif";
            Notes.save1Note(this,cont);
        }
    });
    //Detects the changes and shit + s
    $(note).keydown(function(e) {
        var keyList = [9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 91, 92, 144, 145];
        if (keyList.indexOf(e.which) == -1) {
            note.save.src = "images/unsaved.png";
            note.save.className = "unsaved";
            note.changed = true;
        }
        if (e.shiftKey && e.which == 83) {
            e.preventDefault();
            $(this).blur();
        }

    });
    // click on the picture
    $(note.save).click(function() {
        if (note.changed) $(note).blur();
    });
    $(note.save).hover(function() {
        if (note.changed) note.save.src = "images/saved.png";
    }, function() {
        if (note.changed && note.save.src.indexOf("images/loader.gif") == -1) note.save.src = "images/unsaved.png";
    });
    $(note).hide();
    $('#Notes').append(note.save);
    $('#Notes').append(note);
    $(note).slideDown('slow');
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
                note.save.src = "images/saved.png";
                note.save.className = "saved";
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
                $(note.save).slideUp();
                $(note).slideUp();
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
                $(note.save).show();
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
