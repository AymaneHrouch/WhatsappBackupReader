/* -------------------------------------------------- INPUT SETTINGS -------------------------------------------------- */

let dateFormat = "DD/MM/YY, HH:mm aa";

let fileAttachedString = "file attached";

function setFormat() {
  dateFormat = prompt(
    `Set the date format of your export here.
        Available placeholders:
        DD - Day of a month (01 - 31)
        MM - Number of a month (01 - 12)
        YY - Last two digits of a year (00 - 99)
        YYYY - Full year (four digits) 
        HH - Hours in both 12-hour or 24-hour format (00-23)
        mm - Minutes (00-59)
        AA - Ante meridiem and Post meridiem (AM or PM)
        aa - Same as AA, but works if the "AM" or " PM" strings (space before them including) are missing too

        (Eg. for French the date format is: DD/MM/YYYY à HH:mm aa)
        Do you need placeholders for different values? Submit an issue.`,
    "DD/MM/YY, HH:mm aa"
  );

  fileAttachedString = prompt(
    `Set the string marking an attached media file.
            You can find it by searching for a message with an image attached in the exported .txt file
            The message will probably look something like this:
            15/01/21, 11:16 - Username: ‎IMG-20210115-WA0000.jpg (file attached)
            In this case, you are looking for that "file attached" string
            Of course, the string will be different in other languages
            You need to copy the version occuring in your export and replace the value of the constant below with it`,
    "file attached"
  );
}

/* ---------------------------------------------- END OF INPUT SETTINGS ----------------------------------------------- */

// 4YM4N3 - 2019 //
console.log("App has launched!");

//Process the date format into a regex
function setRegex() {
  regexString = dateFormat
    .replaceAll(" ", "\\s")
    .replaceAll("/", "\\/")
    .replaceAll("\\saa", "\\s?[PA]?[M]?")
    .replaceAll("aa", " [PA]?[M]?")
    .replaceAll("AA", "[PA][M]")
    .replaceAll("mm", "\\d{1,2}")
    .replaceAll("HH", "\\d{1,2}")
    .replaceAll("DD", "\\d{1,2}")
    .replaceAll("MM", "\\d{1,2}")
    .replaceAll("YYYY", "[1-9][0-9][0-9][0-9]")
    .replaceAll("YY", "[1-9][0-9]");
  // Regex to detect the beginning of a line because of the pattern dd/mm/yy, hh:mm - Username: message here
  return new RegExp("(?:[\\r\\n]*)(?=^" + regexString + "\\s-\\s)", "m");
}

const input = document.getElementById("input");
const downloadLink = document.getElementById("download-link");
input.addEventListener("change", inputType);
input.addEventListener("change", handleChange);

var allow = true;

// A function to check whether the uploaded file is a text file or not
function inputType() {
  if (document.getElementById("input").files[0].type.match("text/plain")) {
    allow = true;
  } else {
    allow = false;
  }
  return 0;
}

// extracting the title of the uploaded file to display it instead of "Upload file..."
document.querySelector("#input").addEventListener("change", function (e) {
  if (allow) {
    var fileName = e.target.value.split("\\").pop();
    if (fileName) {
      document.getElementsByTagName("label")[0].innerHTML =
        "<strong>" + fileName + "</strong>";
    } else {
      console.log("error");
    }
  }
});

// Function to handle change of the input
function handleChange(event) {
  if (!event.target.files || !allow) {
    // if the file doesn't exist or it's not a text file
    alert("You didn't upload a text file, please try again.");
    return;
  }

  readFile(event.target.files[0]).then(contents => {
    const convertedFile = convertFile(contents);
    updateDownloadLink(createDownloadableUrl(convertedFile));
  });
}

// Function to read the text file and get the text inside it, returns a Promise so we can use it in handleChange()
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
  });
}

// After we finish our operations we have to create a download link
function createDownloadableUrl(contents) {
  const textBlob = new Blob([contents], {
    type: "text/plain",
  });
  return URL.createObjectURL(textBlob);
}

// function to set the downloading link to the button and then make it appear
function updateDownloadLink(url) {
  downloadLink.href = url;
  downloadLink.hidden = false;
}

// Our main function where we get the file content as an input and then output the index.html content
function convertFile(contents) {
  // export dates and put them in an array
  var regex = setRegex(dateFormat);
  var date = (function () {
    var arr = [];
    arrPerLine = contents
      .split(regex)
      .filter(Boolean)
      .map(text => text.replace(/[\r\n]+/g, "<br>"));

    for (i = 0; i < arrPerLine.length; i++) {
      arrPerLine[i] = arrPerLine[i].split("-");
    }
    for (i = 0; i < arrPerLine.length; i++) {
      arr[i] = arrPerLine[i][0];
    }
    return arr;
  })();

  // export the messages and put them in an array
  var messages = (function () {
    var arr = [];
    arrPerLine = contents
      .split(regex)
      .filter(Boolean)
      .map(text => text.replace(/[\r\n]+/g, "<br>"));
    for (i = 0; i < arrPerLine.length; i++) {
      arrPerLine[i] = arrPerLine[i].split(": ");
      arr[i] = arrPerLine[i][1];
    }
    return arr;
  })();

  // export usernames
  var usernames = (function () {
    var arr = [];
    arrPerLine = contents
      .split(regex)
      .filter(Boolean)
      .map(text => text.replace(/[\r\n]+/g, "<br>"));
    for (i = 0; i < arrPerLine.length; i++) {
      arrPerLine[i] = arrPerLine[i].split(": ");
    }
    for (i = 0; i < arrPerLine.length; i++) {
      for (j = 0; j < arrPerLine[i].length; j++) {
        arrPerLine[i][j] = arrPerLine[i][j].split("- ");
      }
    }

    for (i = 0; i < arrPerLine.length; i++) {
      arr[i] = arrPerLine[i][0][1];
    }
    return arr;
  })();

  // join all the components
  var main = (function () {
    var arr = [
      '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>Backup by WBR</title> <style> body{background-color: #cce6ff; } .container {border: 2px solid #dedede; background-color: #d4fac7; border-radius: 5px; padding: 10px; font-family: Segoe UI; letter-spacing: 0.5px; padding-bottom: 23px; max-width: 600px; margin: auto; margin-bottom: 10px; } .darker {border-color: #ccc; background-color: #b7f7a1; } .darker .username{border-color: #ccc; } .username {width: 100%; padding-bottom: 10px; border-bottom: 1px solid #dadde1; color: black; font-size: 18px; font-weight: bold; line-height: 18px; margin-bottom: 12px; letter-spacing: 1px; } audio {width: 100%; } .date {border-top: 1px solid #dadde1; float: right; color: #aaa; margin: 2px; } .container img {width: 350px; } .footer{margin: auto; max-width: 600px; color:#7f7f7f; text-align: center; } </style> </head> <body>',
    ];
    let unique = [...new Set(usernames)]; // Array of usernames, it should contain just two elements
    var userOne = unique[1];

    for (i = 0; i < date.length; i++) {
      var classe = "",
        direction = "right",
        mediaFile = "";
      var hasOpus = -1,
        hasFileAttached = -1;
      if (usernames[i] == userOne) {
        classe = "darker"; // one user should have this class so their container have a different styling
      }
      try {
        hasOpus = messages[i].indexOf(".opus (" + fileAttachedString + ")"); // search if the message contain an audio file
        hasFileAttached = messages[i].indexOf("(" + fileAttachedString + ")"); // search if the message contain an attached file
        hasJpg = messages[i].indexOf(".jpg (" + fileAttachedString + ")"); // search if the message contain a picture
        hasMp4 = messages[i].indexOf(".mp4 (" + fileAttachedString + ")"); // search if the message contain a video
      } catch (err) {
        console.log("OK");
      }
      if (messages[i] == undefined) {
        // if message is empty
        html =
          '<div class="container"><div>' +
          usernames[i] +
          '</div> <div class="date">' +
          date[i] +
          "</div> </div>";
      } else if (hasOpus != -1 && hasFileAttached != -1) {
        // handle message when it contains audio file

        mediaFile = messages[i].split(".opus (" + fileAttachedString + ")");
        mediaFile[0] = mediaFile[0].replace(/&lrm;|\u200E/gi, ""); //remove left-to-right text mark that would break link to the file
        mediaFile[0] = mediaFile[0].replace(/&rlm;|\u200F/gi, ""); //remove right-to-left text mark that would break link to the file

        html =
          '<div class="container ' +
          classe +
          '"> <div class="username">' +
          usernames[i] +
          '</div> <audio controls> <source src="' +
          mediaFile[0] +
          '.opus" type="audio/ogg"> </audio> <div class="date">' +
          date[i] +
          "</div> </div>";
      } else if (hasFileAttached != -1 && hasJpg != -1) {
        // handle message when it contains picture
        mediaFile = messages[i].split(".jpg (" + fileAttachedString + ")");
        mediaFile[0] = mediaFile[0].replace(/&lrm;|\u200E/gi, ""); //remove left-to-right text mark that would break link to the file
        mediaFile[0] = mediaFile[0].replace(/&rlm;|\u200F/gi, ""); //remove right-to-left text mark that would break link to the file

        html =
          '<div class="container ' +
          classe +
          '"><div class="username">' +
          usernames[i] +
          '</div> <div> <a href="' +
          mediaFile[0] +
          '.jpg" target="_blank"><img src="' +
          mediaFile[0] +
          '.jpg" alt=""></a> </div> <div>' +
          mediaFile[1] +
          '</div> <div class="date">' +
          date[i] +
          "</div> </div>";
      } else if (hasFileAttached != -1 && hasMp4 != -1) {
        // handle message when it contains a video file
        mediaFile = messages[i].split(".mp4 (" + fileAttachedString + ")");
        mediaFile[0] = mediaFile[0].replace(/&lrm;|\u200E/gi, ""); //remove left-to-right text mark that would break link to the file
        mediaFile[0] = mediaFile[0].replace(/&rlm;|\u200F/gi, ""); //remove right-to-left text mark that would break link to the file

        html =
          '<div class="container ' +
          classe +
          '"> <div class="username"><pre>' +
          usernames[i] +
          '     <a href="' +
          mediaFile[0] +
          '.mp4" target="_blank">Open video in a new window</a></pre></div> <div><video width="250" controls><source src="' +
          mediaFile[0] +
          '.mp4" alt=""></video></div> <div>' +
          mediaFile[1] +
          '</div> <div class="date">' +
          date[i] +
          "</div> </div>";
      } else {
        // handle message when it does NOT contain any media
        html =
          '<div class="container ' +
          classe +
          '"> <div class="username">' +
          usernames[i] +
          "</div> <div>" +
          messages[i] +
          '</div> <div class="date">' +
          date[i] +
          "</div> </div>";
      }
      arr.push(html);
    }

    var dateOfGenerating = new Date(); // get date of generating the exported chat!

    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    arr.push(
      '<div class="footer">Generated on ' +
        days[dateOfGenerating.getDay()] +
        ", " +
        months[dateOfGenerating.getMonth()] +
        " " +
        dateOfGenerating.getDate() +
        ", " +
        dateOfGenerating.getFullYear() +
        " at " +
        dateOfGenerating.getHours() +
        ":" +
        dateOfGenerating.getMinutes() +
        '<br>All rights reserved to <a href="http://aymane.hrouch.me" target="_blank">Aymane Hrouch</a> &copy; 2019</div> </body>'
    );
    arr = arr.join("\n");
    return arr;
  })();

  return main;
}
