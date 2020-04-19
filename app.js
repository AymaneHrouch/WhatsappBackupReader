// 4YM4N3 // 
console.log("App launched!")

const input = document.getElementById('input')
const downloadLink = document.getElementById('download-link')
input.addEventListener('change', inputType)
input.addEventListener('change', handleChange)

var allow = true;

function inputType() {
    if (document.getElementById('input').files[0].type.match('text/plain')) {
        allow = true
    } else {
        allow = false
    }
    return 0
}

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


function handleChange(event) {
    if (!event.target.files || !allow) {
        alert('You didn\'t upload a text file, please try again.')
        return
    }

    readFile(event.target.files[0]).then(contents => {
        const convertedFile = convertFile(contents)
        updateDownloadLink(createDownloadableUrl(convertedFile))
    })
}

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

function createDownloadableUrl(contents) {
    const textBlob = new Blob([contents], {
        type: 'text/plain'
    })
    return URL.createObjectURL(textBlob)
}

function updateDownloadLink(url) {
    downloadLink.href = url
    downloadLink.hidden = false
}

function convertFile(contents) {
	var regex = /(?:[\r\n]*)(?=^\d{1,2}\/\d{1,2}\/[1-9][0-9],\s\d{1,2}:\d{1,2}\s[PA]?[M]?\s?-\s)/m;
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


    var messages = (function() {
        var arr = [];
        arrPerLine = contents.split(regex).filter(Boolean).map(text => text.replace(/[\r\n]+/g, "<br>"));
        for (i = 0; i < arrPerLine.length; i++) {
            arrPerLine[i] = arrPerLine[i].split(': ');
            arr[i] = arrPerLine[i][1]
        }
        return arr
    })();




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

    var main = (function() {

        var arr = ['<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>Backup by WBR</title> <style> body{background-color: #cce6ff; } .container {border: 2px solid #dedede; background-color: #d4fac7; border-radius: 5px; padding: 10px; font-family: Segoe UI; letter-spacing: 0.5px; padding-bottom: 23px; max-width: 600px; margin: auto; margin-bottom: 10px; } .darker {border-color: #ccc; background-color: #b7f7a1; } .darker .username{border-color: #ccc; } .username {width: 100%; padding-bottom: 10px; border-bottom: 1px solid #dadde1; color: black; font-size: 18px; font-weight: bold; line-height: 18px; margin-bottom: 12px; letter-spacing: 1px; } audio {width: 100%; } .date {border-top: 1px solid #dadde1; float: right; color: #aaa; margin: 2px; } .container img {width: 350px; } .footer{margin: auto; max-width: 600px; color:#7f7f7f; text-align: center; } </style> </head> <body>'];
        let unique = [...new Set(usernames)];
        var userOne = unique[1];
        

        for (i = 0; i < date.length; i++) {
            var classe = "",
                direction = "right",
                yass = "";
            var n = -1,
                m = -1;
            if (usernames[i] == userOne) {
                classe = "darker"
            }
            try {
                n = messages[i].search(".opus");
                m = messages[i].search("(file attached)");
                p = messages[i].search(".jpg");
                q = messages[i].search(".mp4");
            } catch (err) {
                console.log("OK")
            }
            if (messages[i] == undefined) { // message khawi
                html = '<div class="container"><div>' + usernames[i] + '</div> <div class="date">' + date[i] + '</div> </div>'
            } else if (n != -1 && m != -1) { // audio

                yass = messages[i].split('.opus (file attached)');


                html = '<div class="container ' + classe + '"> <div class="username">' + usernames[i] + '</div> <audio controls> <source src="' + yass[0] + '.opus" type="audio/ogg"> </audio> <div class="date">' + date[i] + '</div> </div>'


            } else if (m != -1 && p != -1) { // tsawer
                yass = messages[i].split('.jpg (file attached)');

                html = '<div class="container ' + classe + '"><div class="username">' + usernames[i] + '</div> <div> <a href="' + yass[0] + '.jpg" target="_blank"><img src="' + yass[0] + '.jpg" alt=""></a> </div> <div>' + yass[1] + '</div> <div class="date">' + date[i] + '</div> </div>'

            } else if (m != -1 && q != -1) { // videos
                yass = messages[i].split('.mp4 (file attached)');

                html = '<div class="container ' + classe + '"> <div class="username"><pre>' + usernames[i] + '     <a href="' + yass[0] + '.mp4" target="_blank">Open video in a new window</a></pre></div> <div><video width="250" controls><source src="' + yass[0] + '.mp4" alt=""></video></div> <div>' + yass[1] + '</div> <div class="date">' + date[i] + '</div> </div>';

            } else { // text message
                html = '<div class="container ' + classe + '"> <div class="username">' + usernames[i] + '</div> <div>' + messages[i] + '</div> <div class="date">' + date[i] + '</div> </div>'
            }


            arr.push(html)
        }



        var d = new Date();

        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];



        arr.push('<div class="footer">Generated on ' + days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' at ' + d.getHours() + ':' + d.getMinutes() + '<br>All rights reserved to <a href="http://mywebsite.com" target="_blank">WBR</a> &copy; 2019</div> </body>');
        arr = arr.join('\n');
        return arr
    })()


    return main

}