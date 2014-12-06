var login = localStorage['Login'];
var password = localStorage['Password'];
var URL = localStorage['URL'];

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
                $("#Loading").hide();
                $("#Message").html(chrome.i18n.getMessage("welcome"));
                $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
                for (var n in notes) {
                    var note = document.createElement('div');
                    note.className = 'Note';
                    note.id = notes[n]['id'];
                    var content = notes[n]['content'];
                    content = content.split('\n');
                    for (var c=0; c < content.length; c++) {
                        note.innerHTML += content[c]+'<br>'
                    }
                    note.contentEditable = true;
					note.addEventListener('blur', function () {
                        $("#Loading").fadeIn("fast");
                        var cont = this.innerHTML.split('<br>');
                        for (var i=cont.length-1; i>0; i--) {
                            if (cont[i] == '') cont.splice(i,1);
                            else break;
                        }
                        cont = cont.join('\n')
                        if (cont == "") {
							$("#"+this.id).slideUp();
							Notes.delete1Note(this.id);
						} else Notes.save1Note(this.id,cont);
					});
                    document.body.appendChild(note);
                }
 	    },
 	    error: function () {
            $("#Message").html(chrome.i18n.getMessage("error_connection"));
            $("#NewNote").hide();
            $("#Loading").hide();
            $("#Message").fadeIn("fast");
 	    },
		timeout: 3000,
 	    beforeSend: function (xhr) {
 	        var auth = btoa(login + ':' + password);
 	        xhr.setRequestHeader('Authorization', 'Basic ' + auth);
 	    }
        });
    },
	save1Note: function(id, content) {
	  $.ajax({
 	    type: 'PUT',
 	    url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+id+'?content='+encodeURIComponent(content),
 	    contentType: 'application/json',
 	    xhrFields: {
 	        widthCredentials: true
 	    },
 	    success: function () {
            $("#Loading").hide();
            $("#Message").html(chrome.i18n.getMessage("note_saved"));
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
 	    },
 	    error: function () {
            $("#Loading").hide();
            $("#Message").html(chrome.i18n.getMessage("error"));
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
 	    },
 	    beforeSend: function (xhr) {
 	        var auth = btoa(login + ':' + password);
 	        xhr.setRequestHeader('Authorization', 'Basic ' + auth);
 	    }
      });
	},
    delete1Note: function(id) {
      $.ajax({
        type: 'DELETE',
        url: localStorage['URL'] + "/index.php/apps/notes/api/v0.2/notes/"+id,
        contentType: 'application/json',
        xhrFields: {
            widthCredentials: true
        },
        success: function () {
            $("#Loading").hide();
            $("#Message").html(chrome.i18n.getMessage("note_deleted"));
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
        },
        error: function () {
			$("#"+this.id).slideDown();
            $("#Loading").hide();
            $("#Message").html(chrome.i18n.getMessage("error"));
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
        },
        beforeSend: function (xhr) {
            var auth = btoa(login + ':' + password);
            xhr.setRequestHeader('Authorization', 'Basic ' + auth);
        }
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
            $("#Message").html(chrome.i18n.getMessage("new_note_added"));
            $("#Loading").hide();
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
        },
        error: function () {
			note.slideUp();
            $("#Loading").hide();
            $("#Message").html(chrome.i18n.getMessage("error"));
            $("#Message").fadeIn("fast").delay(1000).fadeOut('slow');
        },
        beforeSend: function (xhr) {
            var auth = btoa(login + ':' + password);
            xhr.setRequestHeader('Authorization', 'Basic ' + auth);
        }
      });
    },
};

document.addEventListener('DOMContentLoaded', function () {
    if (!URL || !login || !password) {
        window.location.replace("options.html");
    }
    $("#Loading").fadeIn("fast");
    Notes.requestNotes();
    $("#NewNote").click(function() {
        $("#Loading").fadeIn("fast");
		var note = document.createElement('div');
		note.className = 'Note';
		note.contentEditable = true;
		note.style.display = 'none';
		note.addEventListener('blur', function () {
			$("#Loading").fadeIn("fast");
			var cont = this.innerHTML.split('<br>');
			for (var i=cont.length-1; i>0; i--) {
				if (cont[i] == '') cont.splice(i,1);
				else break;
			}
			cont = cont.join('\n')
			if (cont == "") {
				$("#"+this.id).slideUp();
				Notes.delete1Note(this.id);
			} else Notes.save1Note(this.id,cont);
		});
		document.body.appendChild(note);
		$(note).slideDown();
		note.focus();
        Notes.add1Note(note);
    });
    $("#NewNote").hover(function() {
            $("#Message").html(chrome.i18n.getMessage("add_new_note"));
            $("#Message").fadeIn("fast");
        },
        function() {
            $("#Message").fadeOut("fast");
    });
});
