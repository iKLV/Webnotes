var URL = localStorage['URL'];

function printMessage(message) {
    $("#Message").html(chrome.i18n.getMessage(message));
    $("#Loading").fadeOut('slow');
    $("#Message").fadeIn('fast');
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
	
    // Save, add or delete the note if unselected
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
            $(this).slideUp('slow');
            $(this.save).slideUp('slow');
            if (id) {
				$("#Loading").fadeIn("fast");
				Notes.delete1Note(this);
			}
        } else if (note.changed) {
            note.save.src = "images/loader.gif";
			this.content = cont;
			if (!id) Notes.add1Note(this);
            else Notes.save1Note(this);
        }
    });
	
    // Change the state of the note if one character is changed and save is shift + s are pressed
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
	
    // Actions of the save button
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
				localStorage['Notes'] = JSON.stringify(notes);
                for (var n in notes) create1Note(notes[n]['id'],notes[n]['content']);
				$("#Message").hide();
				printMessage("welcome");
            },
            error: function () {
                $("#NewNote").hide();
                printMessage("error_connection");
				var notes = JSON.parse(localStorage['Notes']);
				for (var n in notes) {
					var note = create1Note(notes[n]['id'],notes[n]['content']);
					note.contentEditable = false;
				}
            },
            timeout: 3000,
        });
    },
	save1Note: function(note) {
	    $.ajax({
            type: 'PUT',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+note.id+'?content='+encodeURIComponent(note.content),
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function () {
				var notes = JSON.parse(localStorage['Notes']);
				for (var n in notes) if (notes[n]['id'] == note.id) notes[n]['content'] = note.content;
				localStorage['Notes'] = JSON.stringify(notes);
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
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes?content="+encodeURIComponent(note.content),
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (newnote) {
                note.id = newnote['id'];
				var notes = JSON.parse(localStorage['Notes']);
				notes.push({'id': note.id, 'content': note.content});
				localStorage['Notes'] = JSON.stringify(notes);
                note.changed = false;
                note.save.src = "images/saved.png";
                note.save.className = "saved";				
                //printMessage("new_note_added");
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
				var notes = JSON.parse(localStorage['Notes']);
				for (var n in notes) if (notes[n]['id'] == note.id) notes.splice(n,1);
				localStorage['Notes'] = JSON.stringify(notes);
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
	
	// Hover for the New note button
    $("#NewNote").hover(function() {
            $("#Message").html(chrome.i18n.getMessage("add_new_note"));
            $("#Message").fadeIn("fast");
        },
        function() {
            $("#Message").fadeOut("fast");
    });
	
	// Create a new note if click on the button
    $("#NewNote").click(function() {
        var note = create1Note(null,'');
        note.focus();
		note.save.src = "images/unsaved.png";
        note.save.className = "unsaved";
        note.changed = true;
    });
	
	// Create a new note if shift + n
    $('body').keypress(function(e) {
        if (e.shiftKey && e.which == 78) {
            e.preventDefault();
            $("#NewNote").click();
        }
    });
});
