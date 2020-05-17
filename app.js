// 4YM4N3 - 2019 // 
console.log("App has launched!")

const input = document.getElementById('input')
const downloadLink = document.getElementById('download-link')
input.addEventListener('change', inputType)
input.addEventListener('change', handleChange)

var allow = true;

// A function to check weither the uploaded file is a text file or not
function inputType() {
    if (document.getElementById('input').files[0].type.match('text/plain')) {
        allow = true
    } else {
        allow = false
    }
    return 0;
}

// extracting the title of the uploaded file to display it instead of "Upload file..."
document.querySelector('#input').addEventListener('change', function(e) {
    if (allow) {
        var fileName = e.target.value.split('\\').pop();
        if (fileName) {
            document.getElementsByTagName('label')[0].innerHTML = '<strong>' + fileName + '</strong>';
        } else {
            console.log("error")
        }
    }
})

// Function to handle change of the input 
function handleChange(event) {
    if (!event.target.files || !allow) { // if the file doesn't exist or it's not a text file
        alert('You didn\'t upload a text file, please try again.')
        return
    }

    readFile(event.target.files[0]).then(contents => {
        const convertedFile = convertFile(contents)
        updateDownloadLink(createDownloadableUrl(convertedFile))
    })
}

// Function to read the text file and get the text inside it, returns a Promise so we can use it in handleChange()
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.onerror = reject
    })
}

// After we finish our operations we have to create a download link
function createDownloadableUrl(contents) {
    const textBlob = new Blob([contents], {
        type: 'text/plain'
    })
    return URL.createObjectURL(textBlob)
}

// function to set the downloading link to the button and then make it appear
function updateDownloadLink(url) {
    downloadLink.href = url
    downloadLink.hidden = false
}

// Our main function where we get the file content as an input and then output the index.html content
function convertFile(contents) {
    // Regex to detect the beginning of a line because of the pattern dd/mm/yy, hh:mm - Username: message here
	var regex = /(?:[\r\n]*)(?=^\d{1,2}\/\d{1,2}\/[1-9][0-9],\s\d{1,2}:\d{1,2}\s[PA]?[M]?\s?-\s)/m;

    // export dates and put them in an array
    var date = (function() {
        var arr = [];
        arrPerLine = contents.split(regex).filter(Boolean).map(text => text.replace(/[\r\n]+/g, "<br>"));
        for (i = 0; i < arrPerLine.length; i++) {
            arrPerLine[i] = arrPerLine[i].split('-');
        }
        for (i = 0; i < arrPerLine.length; i++) {
            arr[i] = arrPerLine[i][0]
        }
        return arr;
    })();

    // export the messages and put them in an array 
    var messages = (function() {
        var arr = [];
        arrPerLine = contents.split(regex).filter(Boolean).map(text => text.replace(/[\r\n]+/g, "<br>"));
        for (i = 0; i < arrPerLine.length; i++) {
            arrPerLine[i] = arrPerLine[i].split(': ');
            arr[i] = arrPerLine[i][1]
        }
        return arr
    })();

    // export usernames
    var usernames = (function() {
        var arr = [];
        arrPerLine = contents.split(regex).filter(Boolean).map(text => text.replace(/[\r\n]+/g, "<br>"));
        for (i = 0; i < arrPerLine.length; i++) {
            arrPerLine[i] = arrPerLine[i].split(': ');
        }
        for (i = 0; i < arrPerLine.length; i++) {
            for (j = 0; j < arrPerLine[i].length; j++) {
                arrPerLine[i][j] = arrPerLine[i][j].split('- ')
            }
        }

        for (i = 0; i < arrPerLine.length; i++) {
            arr[i] = arrPerLine[i][0][1];
        }
        return arr;
    })();

    // join all the components
    var main = (function() {

        var arr = ['<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>Backup by WBR</title> <style> body{background-color: #cce6ff; } .container {border: 2px solid #dedede; background-color: #d4fac7; border-radius: 5px; padding: 10px; font-family: Segoe UI; letter-spacing: 0.5px; padding-bottom: 23px; max-width: 600px; margin: auto; margin-bottom: 10px; } .darker {border-color: #ccc; background-color: #b7f7a1; } .darker .username{border-color: #ccc; } .username {width: 100%; padding-bottom: 10px; border-bottom: 1px solid #dadde1; color: black; font-size: 18px; font-weight: bold; line-height: 18px; margin-bottom: 12px; letter-spacing: 1px; } audio {width: 100%; } .date {border-top: 1px solid #dadde1; float: right; color: #aaa; margin: 2px; } .container img {width: 350px; } .footer{margin: auto; max-width: 600px; color:#7f7f7f; text-align: center; } </style> </head> <body>'];
        let unique = [...new Set(usernames)]; // Array of usernames, it should contain just two elements
        var userOne = unique[1];
        

        for (i = 0; i < date.length; i++) {
            var classe = "",
                direction = "right",
                mediaFile = "";
            var n = -1,
                m = -1;
            if (usernames[i] == userOne) {
                classe = "darker" // one user should have this class so their container have a different styling
            }
            try {
                hasOpus = messages[i].search(".opus"); // search if the message contain an audio file
                hasFileAttached = messages[i].search("(file attached)"); // search if the message contain (file attached)
                hasJpg = messages[i].search(".jpg");  // search if the message contain a picture
                hasMp4 = messages[i].search(".mp4");  // search if the message contain a video
            } catch (err) {
                console.log("OK")
            }
            if (messages[i] == undefined) { // if message is empty
                html = '<div class="container"><div>' + usernames[i] + '</div> <div class="date">' + date[i] + '</div> </div>'
            } else if (hasOpus != -1 && hasFileAttached != -1) { // handle message when it contains audio file

                mediaFile = messages[i].split('.opus (file attached)');


                html = '<div class="container ' + classe + '"> <div class="username">' + usernames[i] + '</div> <audio controls> <source src="' + mediaFile[0] + '.opus" type="audio/ogg"> </audio> <div class="date">' + date[i] + '</div> </div>'


            } else if (hasFileAttached != -1 && hasJpg != -1) { // handle message when it contains picture
                mediaFile = messages[i].split('.jpg (file attached)');

                html = '<div class="container ' + classe + '"><div class="username">' + usernames[i] + '</div> <div> <a href="' + mediaFile[0] + '.jpg" target="_blank"><img src="' + mediaFile[0] + '.jpg" alt=""></a> </div> <div>' + mediaFile[1] + '</div> <div class="date">' + date[i] + '</div> </div>'

            } else if (hasFileAttached != -1 && hasMp4 != -1) { // handle message when it contains a video file
                mediaFile = messages[i].split('.mp4 (file attached)');

                html = '<div class="container ' + classe + '"> <div class="username"><pre>' + usernames[i] + '     <a href="' + mediaFile[0] + '.mp4" target="_blank">Open video in a new window</a></pre></div> <div><video width="250" controls><source src="' + mediaFile[0] + '.mp4" alt=""></video></div> <div>' + mediaFile[1] + '</div> <div class="date">' + date[i] + '</div> </div>';

            } else { // handle message when it does NOT contain any media
                html = '<div class="container ' + classe + '"> <div class="username">' + usernames[i] + '</div> <div>' + messages[i] + '</div> <div class="date">' + date[i] + '</div> </div>'
            }
            arr.push(html)
        }



        var dateOfGenerating = new Date(); // get date of generating the exported chat!

        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        arr.push('<div class="footer">Generated on ' + days[dateOfGenerating.getDay()] + ', ' + months[dateOfGenerating.getMonth()] + ' ' + dateOfGenerating.getDate() + ', ' + dateOfGenerating.getFullYear() + ' at ' + dateOfGenerating.getHours() + ':' + dateOfGenerating.getMinutes() + '<br>All rights reserved to <a href="http://cwmn.000webhostapp.com/WBR/" target="_blank">WBR</a> &copy; 2019</div> </body>');
        arr = arr.join('\n');
        return arr
    })()

    return main
}