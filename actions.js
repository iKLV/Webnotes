var URL = localStorage['URL'];
var NOTE= {}

function printMessage(message) {
    $("#Message").html(chrome.i18n.getMessage(message)).fadeIn('fast');
    $("#Loading").fadeOut('slow');
    if (message != 'error_connection') $("#Message").delay(1000).fadeOut('slow');
};

function create1Note(info) {
    // The HTML Div Note
    var note = document.createElement('div');
    note.className = 'Note';
    note.contentEditable = true;
    if (!info.changed) info.changed = false;
    if (!info.minimized) info.minimized = false;
	if (info.id) note.id = info.id;
    if (info.content) {
		content = info.content.split('\n');
		for (var c=0; c < content.length; c++) $(note).append(content[c]+'<br>');
	}

    // Save button
    note.save = document.createElement('img');
    note.save.src = "images/saved.png";
    note.save.className = "saved";
    note.save.contentEditable = false;

    // Minimize button
    note.minimize = document.createElement('img');
    note.minimize.src = "images/minimize.png";
    note.minimize.className = "minimize";

    // Save, add or delete the note if unselected
    $(note).blur(function() {
		// Get the content
        var cont = note.innerHTML.split('<br>');
        var len = cont.length;
        for (var i=1; i<=len; i++) {
            if (cont[len-i] != '') break;
            cont.splice(-1, 1);
        }
        note.innerHTML = cont.join('<br>');
        cont = cont.join('\n');
		info.content = cont;
		
        // Delete
        if (info.content == "") {
            $(note).slideUp('slow');
            $(note.save).fadeOut('slow');
            $(note.minimize).fadeOut('slow');
            if (note.id) {
				$("#Loading").fadeIn("fast");
				Notes.delete1Note(note);
			}
        // Save of Add
        } else if (info.changed) {
            note.save.src = "images/loader.gif";
			// Save
			if (note.id)
                Notes.save1Note(info, note);
			// Add
			else
                Notes.add1Note(info, note);			
        }
    });
	
    // Change the state of the note if one character is changed, save if alt + s are pressed, minimize if alt + m are pressed
    $(note).keydown(function(e) {
        var keyList = [9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 91, 92, 144, 145];
        if (e.altKey && e.which == 83) {
            e.preventDefault();
            $(note).blur();
        } else if (e.altKey && e.which == 77) {
            e.preventDefault();
            if (info.minimized)
                $(note).click();
            else
                $(note.minimize).click();
        } else if (keyList.indexOf(e.which) == -1) {
            note.save.src = "images/unsaved.png";
            note.save.className = "unsaved";
            info.changed = true;
        }
    });
	
    // Hover of the save button
    $(note.save).hover(function() {
        if (info.changed) note.save.src = "images/saved.png";
    }, function() {
        if (info.changed && note.save.src.indexOf("images/loader.gif") == -1) note.save.src = "images/unsaved.png";
    });

    // Action of the minimize button
    $(note.minimize).click(function() {
        $(note.minimize).fadeOut('fast');
        info.minimized = true;
        info.height = $(note).height();
        $(note).animate({"height": "18px", "padding-top":"5px", "margin-bottom": "-3px"}, 'fast', function() {
            $(note).css({"overflow":"hidden", "cursor": "pointer"});
        });
        var notes = JSON.parse(localStorage['Notes']);
        if (!notes[note.id])
            notes[note.id] = {};
        notes[note.id].minimized = true;
        localStorage['Notes'] = JSON.stringify(notes);
    });
    $(note).click(function() {
        if (info.minimized) {
            $(note).animate({"height": "auto", "padding-top":"15px", "margin-bottom": "0"}, 'fast',
              function() {
                $(note).css({"overflow":"initial", "cursor": "initial"});
            });
            $(note.minimize).fadeIn('slow');
            info.minimized = false;
            var notes = JSON.parse(localStorage['Notes']);
            notes[note.id].minimized = false;
            localStorage['Notes'] = JSON.stringify(notes);
        }
    });

    $(note).hide();
    $('#Notes').append(note.minimize).append(note.save).append(note);
    $(note.save).fadeIn(1000);
    // If it is minimized
    if (info.minimized)
        $(note.minimize).click();
    else
       $(note.minimize).fadeIn(1000);
    $(note).slideDown('slow');

    // If it's a new note
    if (note.id == 0) {
        $(note).focus();
        var press = jQuery.Event("keypress");
        press.which = 8;
        $(note).trigger(press);
    }
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
                if (!localStorage.Notes || localStorage.Notes == '{}')
                    var localNotes = {};
                else
                    var localNotes = JSON.parse(localStorage.Notes);
                for (var n in notes) {
                    var info = notes[n];
                    if (localNotes[info.id] && localNotes[info.id].minimized)
                        info.minimized = true;
                    else
                        info.minimized = false;
                    localNotes[info.id] = info;
                    create1Note(info);
                }
                localStorage.Notes = JSON.stringify(localNotes);
				$("#Message").hide();
				printMessage("welcome");
            },
            error: function () {
                $("#NewNote").hide();
                printMessage("error_connection");
				var localNotes = JSON.parse(localStorage.Notes);
				for (var n in notes) {
                    notes[n].contentEditable = false;
                    create1Note(note);
				}
            },
            timeout: 3000,
        });
    },
	save1Note: function(info, note) {
	    $.ajax({
            type: 'PUT',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+note.id+'?content='+encodeURIComponent(info.content),
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (savednote) {
				var localNotes = JSON.parse(localStorage.Notes);
                savednote.minimized = info.minimized;
                localNotes[note.id] = savednote;
				localStorage.Notes = JSON.stringify(localNotes);
				note.save.src = "images/saved.png";
				note.save.className = "saved";
				info.changed = false;
            },
            error: function () {
				note.save.src = "images/unsaved.png";
                printMessage("error");
            },
            timeout: 3000,
        });
	},
    add1Note: function(info, note) {
        console.log(info);
        $.ajax({
            type: 'POST',
            url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes?content="+encodeURIComponent(info.content),
            contentType: 'application/json',
            xhrFields: {
                widthCredentials: true
            },
            success: function (newnote) {
                var localNotes = JSON.parse(localStorage.Notes);
                newnote.minimized = info.minimized;
                localNotes[newnote.id] = newnote;
                localStorage.Notes = JSON.stringify(localNotes);
				info.id = newnote.id;
                note.id = info.id;
				note.save.src = "images/saved.png";
				note.save.className = "saved";
				info.changed = false;
            },
            error: function () {
                note.save.src = "images/unsaved.png";
                printMessage("error");
            },
            timeout: 3000,
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
                var localNotes = JSON.parse(localStorage.Notes);
                delete localNotes[note.id];
                localStorage.Notes = JSON.stringify(localNotes);
                printMessage("note_deleted");
				return true;
            },
            error: function () {
				$(note.save).fadeIn('fast');
				$(note.minimize).fadeIn('fast');
				$(note).slideDown('fast');
                printMessage("error");
            },
            timeout: 3000,
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
    $("#Loading").fadeIn('slow');
	
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
        var note = {};
        create1Note(note);
    });
	
	// Create a new note if alt + n and a new tab if alt + t
    $('body').keydown(function(e) {
        console.log(e.which, e.keyCode, e.altKey);
        if (e.altKey && e.which == 78) {
            e.preventDefault();
            $("#NewNote").click();
        }
        if (e.altKey && e.which == 84) {
            e.preventDefault();
            $("#Bigger").click();
        }
    });
	
	// Hover for the new tab button
	$("#Bigger").hover(function() {
			$("#Bigger").attr('src', 'images/Bigger2.png');
            $("#Message").html(chrome.i18n.getMessage("open_new_tab"));
            $("#Message").fadeIn("fast");
		},
        function() {
			$("#Bigger").attr('src', 'images/Bigger1.png');		
            $("#Message").fadeOut("fast");
	});
});
