var URL = localStorage['URL'];

function printMessage(message) {
    $("#Message").html(chrome.i18n.getMessage(message)).fadeIn('fast');
    $("#Loading").fadeOut('slow');
    if (message != 'error_connection') $("#Message").delay(1000).fadeOut('slow');
};

function create1Note(info) {
    // The HTML Div Note
    var note = document.createElement('div');
    note.className = 'Note';
    if (info.id) note.id = info.id;

    // The text inside the Note
    note.text = document.createElement('p');
    note.text.className = 'text';
	if (!info.offline) note.text.contentEditable = true;
    if (info.content) $(note.text).html(info.content.replace(/\n/g, '<br>'));

    // Minimize button
    note.minimize = document.createElement('img');
    note.minimize.src = "images/minimize.png";
    note.minimize.className = "minimize";

    // Delete button
    note.delete = document.createElement('img');
    note.delete.src = "images/delete.png";
    note.delete.className = "delete";

    // Color button
    note.Color = document.createElement('img');
    note.Color.src = "images/color.png";
    note.Color.className = "color";

    // Color panel
    note.Colorpanel = document.createElement('div');
    note.Colorpanel.className = "colorpanel";
    var colors = ['<div class="colors" style="background:rgb(255,230,100);"></div>',
                  '<div class="colors" style="background:rgb(255,180,105);"></div>',
                  '<div class="colors" style="background:rgb(255,115,75);"></div>',
                  '<div class="colors" style="background:rgb(255,130,220);"></div>',
                  '<div class="colors" style="background:rgb(185,90,255);"></div>',
                  '<div class="colors" style="background:rgb(100,140,255);"></div>',
                  '<div class="colors" style="background:rgb(100,220,240);"></div>',
                  '<div class="colors" style="background:rgb(140,255,100);"></div>',
                  '<div class="colors" style="background:rgb(200,200,200);"></div>',
                  '<div class="colors" style="background:rgb(255,255,255);"></div>'];
    $(note.Colorpanel).html(colors.join(''));

    // Save button
    note.save = document.createElement('img');
    note.save.src = "images/saved.png";
    note.save.className = "saved";

    // Note foot
    note.foot = document.createElement('div');
    note.foot.className = 'foot';

    $(note).hide();
    $(note.foot).append(note.minimize).append(note.delete).append(note.Color).append(note.save);
    $(note).append(note.text).append(note.foot).append(note.Colorpanel);
    $('#Notes').append(note);

    // Save, add or delete the note if unselected
    $(note.text).blur(function() {
		// Get the content
        var cont = $(note.text).html().split('<br>');
        var len = cont.length;
        for (var i=1; i<=len; i++) {
            if (cont[len-i] != '') break;
            cont.splice(-1, 1);
        }
        $(note.text).html(cont.join('<br>'));
        cont = cont.join('\n');
		info.content = cont;
		
        // Delete
        if (info.content == "") {
            $(note).slideUp('slow');
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
    $(note.text).keydown(function(e) {
        var keyList = [9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 91, 92, 144, 145];
        if (e.altKey && e.which == 83) {
            e.preventDefault();
            $(note.text).blur();
        } else if (e.altKey && e.which == 77) {
            e.preventDefault();
            if (info.minimized)
                $(note.text).click();
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
        if (info.changed)
            note.save.src = "images/saved.png";
    }, function() {
        if (info.changed && note.save.src.indexOf("images/loader.gif") == -1)
            note.save.src = "images/unsaved.png";
    });

    // Action of the minimize button
    $(note.minimize).click(function() {
        info.minimized = true;
        info.height = $(note).height();
        $(note).animate({"height": "40px", "margin-bottom": "5px"}, 'fast', function() {
            $(note).css({"overflow":"hidden", "cursor": "pointer"});
        });
        var notes = JSON.parse(localStorage['Notes']);
        if (!notes[note.id])
            notes[note.id] = {};
        notes[note.id].minimized = true;
        localStorage['Notes'] = JSON.stringify(notes);
    });
    $(note.text).click(function() {
        if (info.minimized) {
            $(note).animate({"height": info.height, "margin": "initial"}, 'fast',
              function() {
                $(note).css({"height": "auto", "overflow":"initial", "cursor": "initial"});
            });
            info.minimized = false;
            var notes = JSON.parse(localStorage['Notes']);
            notes[note.id].minimized = false;
            localStorage['Notes'] = JSON.stringify(notes);
        }
    })

    // Menu bar appear if note is hovered or note text focused
    $(note).hover(function() {
        $(note.minimize).fadeIn('slow');
        $(note.delete).fadeIn('slow');
        $(note.Color).fadeIn('slow');
        $(note.foot).css('background-color', 'rgba(0,0,0,0.1)');
    }, function() {
        if (!$(note.text).is(':focus')) {
            $(note.minimize).fadeOut('slow');
            $(note.delete).fadeOut('slow');
            $(note.Color).fadeOut('slow');
            $(note.foot).css('background-color', 'rgba(0,0,0,0)');
        }
    });
    $(note.text).focus(function() {
        $(note.minimize).fadeIn('slow');
        $(note.delete).fadeIn('slow');
        $(note.Color).fadeIn('slow');
        $(note.foot).css('background-color', 'rgba(0,0,0,0.1)');
    });
    $(note.text).focusout(function() {
        if (!$(note).is(':hover')) {
            $(note.minimize).fadeOut('slow');
            $(note.delete).fadeOut('slow');
            $(note.Color).fadeOut('slow');
            $(note.foot).css('background-color', 'rgba(0,0,0,0)');
        }
    });

    // If click on color panel
    $(note.Color).click(function() {
        $(note.Colorpanel).slideToggle('fast');
    });
    $('body').on('click', function(event) {
        if (!$(event.target).closest(note).length) {
            $(note.Colorpanel).slideUp('fast');
        }
    });


    // If click on one color
    $('.colors').click(function() {
        var currentnote = $(this).parent().parent();
        var color = $(this).css('background-color');
        currentnote.css('background-color', color);
        info.color = color;
        $(this).parent().slideUp('fast');
        var notes = JSON.parse(localStorage['Notes']);
        var id = currentnote.attr('id');
        if (!notes[id])
            notes[id] = {};
        notes[id].color = color;
        localStorage['Notes'] = JSON.stringify(notes);
    });

    // Click on delete
    $(note.delete).click(function() {
        $(note).slideUp('slow');
        if (note.id) {
            $("#Loading").fadeIn("fast");
            Notes.delete1Note(note);
        }
    });

    // If it is minimized
    if (info.minimized)
        $(note.minimize).click();

    // If it is from an other color
    if (info.color)
        $(note).css('background-color', info.color);
    
    $(note).slideDown('fast', function() {
        // If it is a new note
        if (!note.id) {
            $('body').scrollTop($('body')[0].scrollHeight);
            $(note.text).focus();
            var press = jQuery.Event("keydown");
            press.which = 8;
            $(note.text).trigger(press);
        }
    });
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
                if (!localStorage.Notes)
                    var localNotes = {};
                else
                    var localNotes = JSON.parse(localStorage.Notes);
				var newLocalNotes = {}
                for (var n in notes) {
                    var info = notes[n];
                    if (localNotes[info.id] && localNotes[info.id].minimized)
                        info.minimized = true;
                    if (localNotes[info.id] && localNotes[info.id].color)
                        info.color = localNotes[info.id].color;
                    newLocalNotes[info.id] = info;
                    create1Note(info);
                }
                localStorage.Notes = JSON.stringify(newLocalNotes);
				$("#Message").hide();
				printMessage("welcome");
            },
            error: function () {
                $("#NewNote").hide();
                printMessage("error_connection");
				var localNotes = JSON.parse(localStorage.Notes);
				for (var id in localNotes) {
                    localNotes[id].offline = true;
                    create1Note(localNotes[id]);
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
                savednote.color = info.color;
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
                newnote.color = info.color;
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

    $("#NewNote").attr('alt', chrome.i18n.getMessage("add_new_note"));
    $("#Header a:first-child").attr('title', chrome.i18n.getMessage("add_new_note"));
    $("#Opentab").attr('alt', chrome.i18n.getMessage("open_new_tab"));
    $("#Header a:last-child").attr('title', chrome.i18n.getMessage("open_new_tab"));

    // Header
    $('#Header').fadeIn('slow');
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
        if (e.altKey && e.which == 78) {
            e.preventDefault();
            $("#NewNote").click();
        }
        if (e.altKey && e.which == 84) {
            e.preventDefault();
            $("#Opentab").click();
        }
    });
	
	// Hover for the new tab button
	$("#Opentab").hover(function() {
            $("#Message").html(chrome.i18n.getMessage("open_new_tab"));
            $("#Message").fadeIn("fast");
		},
        function() {
            $("#Message").fadeOut("fast");
	});
});
