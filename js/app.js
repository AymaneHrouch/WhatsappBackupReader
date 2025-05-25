/* --------------------------------------------------  INPUT HANDLING -------------------------------------------------- */
const input = document.getElementById("input");
const zipInput = document.getElementById("zipInput");
const downloadLink = document.getElementById("download-link");
input.addEventListener("change", handleChange);
zipInput.addEventListener("change", handleZipFile);
let allow = true;
var inputFileName;

// Function to read the text file and get the text inside it, returns a Promise so we can use it in handleChange()
const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
  });
};

// After we finish our operations we have to create a download link
const createDownloadableUrl = (contents) => {
  const textBlob = new Blob([contents], {
    type: "text/plain",
  });
  return URL.createObjectURL(textBlob);
};

// function to set the downloading link to the button and then make it appear
const updateDownloadLink = (url, downloadFileName) => {
  downloadLink.href = url;
  downloadLink.download = downloadFileName;
  downloadLink.hidden = false;
};

/* -------------------------------------------------- CONSTANTS & GLOBAL VARS HANDLING -------------------------------------------------- */

let dateFormat = "DD/MM/YY, HH:mm aa";
let fileAttachedString = "file attached";

// Function to help users set custom dateFormat and fileAttachedString for non-English exports
const setFormat = () => {
  dateFormat = prompt(
    `
      -->-> Set the date format of your export here <-<--

Available placeholders:
DD - Day of a month (01 - 31)
MM - Number of a month (01 - 12)
YY - Last two digits of a year (00 - 99)
YYYY - Full year/Four digits (1000 - 9999) 
HH - Hours in both 12-hour or 24-hour format (00-23)
mm - Minutes (00-59)
AA - Ante meridiem and Post meridiem (AM or PM)
aa - Same as AA, but works if the "AM" or " PM" strings (space before them including) are missing too

(Eg. for French the date format is: DD/MM/YYYY à HH:mm aa)
Do you need placeholders for different values? Submit an issue.`,
    dateFormat
  );

  fileAttachedString = prompt(
    `
      -->-> Set the string marking an attached media file. <-<--

You can find it by searching for a message with an image attached in the exported .txt file
The message will probably look something like this:
15/01/21, 11:16 - Username: ‎IMG-20210115-WA0000.jpg (file attached)
In this case, you are looking for that "file attached" string
Of course, the string will be different in other languages
You need to copy the version occuring in your export into the field below

(Eg. For French it is "fichier joint")
`,
    fileAttachedString
  );
};

/* Generate date of parsing*/
// Function to generate a leading zero
const pad = (n) => (n < 10 ? `0${n}` : n);

// Function to generate string containing the date of parsing
const genDate = () => {
  const d = new Date();
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const htmlHeader = `
<!DOCTYPE html>
<html lang="en">
  <head> 
    <meta charset="UTF-8">
    <title>Backup by WBR</title>
    <style>
      body{background-color: #cce6ff; } 
      .container {
        border: 2px solid #dedede; 
        background-color: #d4fac7; 
        border-radius: 5px; padding: 10px; 
        font-family: Segoe UI; letter-spacing: 0.5px; 
        padding-bottom: 23px; 
        max-width: 600px; 
        margin: auto; margin-bottom: 10px; 
      } 
      .darker {
        border-color: #ccc; 
        background-color: #b7f7a1; 
      } .darker 
      .username{border-color: #ccc; 
      } 
      .username {
        width: 100%; 
        padding-bottom: 10px; 
        border-bottom: 1px solid #dadde1; 
        color: black; font-size: 18px; 
        font-weight: bold; 
        line-height: 18px; 
        margin-bottom: 12px; 
        letter-spacing: 1px; 
      } audio {width: 100%; } 
      .date {border-top: 1px solid #dadde1; 
        float: right; 
        color: #aaa; 
        margin: 2px; 
      } 
      .container img {
        width: 350px; 
      } .footer{margin: auto; 
        max-width: 600px; 
        color:#7f7f7f; 
        text-align: center; 
      } 
    </style>
  </head>
  <body>`;

const htmlFooter = `
<div class="footer">
Generated on ${genDate()}<br />
All rights reserved to <a href="http://aymane.hrouch.me" target="_blank">Aymane Hrouch</a> &copy; ${new Date().getFullYear()}
</div> 
</body>
</html>`;

// Process the date format into a regex
const getRegex = () => {
  regexString = dateFormat
    .replaceAll(" ", "\\s")
    .replaceAll("/", "\\/")
    .replaceAll("\\saa", "\\s?[PA]?[M]?")
    .replaceAll("aa", " [PA]?[M]?")
    .replaceAll("AA", "[PA][M]")
    .replaceAll(/mm|HH|DD|MM/g, "\\d{1,2}")
    .replaceAll("YYYY", "[1-9][0-9][0-9][0-9]")
    .replaceAll("YY", "[1-9][0-9]");
  // Regex to detect the beginning of a line because of the pattern dd/mm/yy, hh:mm - Username: message here (for English)
  return new RegExp(`(?:[\\r\\n]*)(?=^${regexString}\\s-\\s)`, "m");
};

/* --------------------------------------------------  GET COMPONENTS -------------------------------------------------- */

const getDates = (contents) => {
  const lines = contents.slice(0);
  const arr = [];

  for (i = 0; i < lines.length; i++) {
    lines[i] = lines[i].split("-");
  }
  for (i = 0; i < lines.length; i++) {
    arr[i] = lines[i][0];
  }
  return arr;
};

const getMessages = (contents) => {
  const lines = contents.slice(0);
  const arr = [];

  for (i = 0; i < lines.length; i++) {
    lines[i] = lines[i].split(": ");
    arr[i] = anchorme({
      input: lines[i][1],
      options: { attributes: { target: "_blank" } },
    });
  }
  return arr;
};

const getUsernames = (contents) => {
  const lines = contents.slice(0);
  var arr = [];

  for (i = 0; i < lines.length; i++) {
    lines[i] = lines[i].split(": ");
  }

  for (i = 0; i < lines.length; i++) {
    for (j = 0; j < lines[i].length; j++) {
      lines[i][j] = lines[i][j].split("- ");
    }
  }

  for (i = 0; i < lines.length; i++) {
    arr[i] = lines[i][0][1];
  }
  return arr;
};

/* Function to check if the message contain any file or not, if yes return the file extension (or true, if the file doesn't have one), else return null */
const getFileExtension = (message) => {
  if (message.includes(` (${fileAttachedString})`)) {
    let regex = new RegExp(`(\\.[a-zA-Z0-9]{1,10})?\\s\\(${fileAttachedString}\\)`, "gm"); //Let's hope that no file has extension longer than 10 characters
    let substrStart = message.search(regex) + 1;
    regex = new RegExp(`\\s\\(${fileAttachedString}\\)`, "gm");
    let substrEnd = message.search(regex);
    let ext = message.substring(substrStart, substrEnd);
    if (ext !== " ")
      //File has no extension
      return ext;
    return true;
  }
  return null;
};

const getBody = (message) => {
  if (!message) return "";

  let file;
  const extension = getFileExtension(message);
  if (extension) {
    if (extension !== true) file = message.split(`.${extension} (${fileAttachedString})`);
    else file = message.split(` (${fileAttachedString})`);
    file[0] = file[0].replace(/&lrm;|\u200E/gi, ""); //remove left-to-right text mark that would break link to the file
    file[0] = file[0].replace(/&rlm;|\u200F/gi, ""); //remove right-to-left text mark that would break link to the file
  }

  const extensionsWithIconsAvailable = [
    "AAC",
    "AI",
    "AIFF",
    "AVI",
    "BMP",
    "C",
    "CPP",
    "CSS",
    "CSV",
    "DAT",
    "DMG",
    "DOC",
    "DOTX",
    "DWG",
    "DXF",
    "EPS",
    "EXE",
    "FLV",
    "GIF",
    "H",
    "HPP",
    "HTML",
    "ICS",
    "ISO",
    "JAVA",
    "JPG",
    "JS",
    "KEY",
    "LESS",
    "MID",
    "MP3",
    "MP4",
    "MPG",
    "ODF",
    "ODS",
    "ODT",
    "OTP",
    "OTS",
    "OTT",
    "PDF",
    "PHP",
    "PNG",
    "PPT",
    "PSD",
    "PY",
    "QT",
    "RAR",
    "RB",
    "RTF",
    "SASS",
    "SCSS",
    "SQL",
    "TGA",
    "TGZ",
    "TIFF",
    "TXT",
    "WAV",
    "XLS",
    "XLSX",
    "XML",
    "YML",
    "ZIP",
  ];

  switch (extension) {
    case "opus":
    case "ogg":
      return `<audio controls><source src="${file[0]}.${extension}" type="audio/ogg"></audio>`;
    case "wav":
      return `<audio controls><source src="${file[0]}.${extension}" type="audio/wav"></audio>`;
    case "mp3":
    case "m4a":
      return `<audio controls><source src="${file[0]}.${extension}" type="audio/mpeg"></audio>`;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      return `
        <div>
          <a href="${file[0]}.${extension}" target="_blank"><img src="${file[0]}.${extension}"></a>
        </div> 
        <div>${file[1]}</div>`;
    case "mp4":
    case "avi":
    case "mov":
    case "m4v":
    case "mkv":
    case "mpg":
    case "mpeg":
      return `
        <a href="${file[0]}.${extension}" target="_blank" style="display: block;">Open video in a new tab</a>
        <div>
          <video width="250" controls><source src="${file[0]}.${extension}" alt=""></video>
        </div>
		<div>${file[1]}</div>`;
    default:
      if (extension && extension !== true && extensionsWithIconsAvailable.includes(extension.toUpperCase()))
        //This means that there is a file and it has an extension...
        return `
          <div>
            <a href="${file[0]}.${extension}" target="_blank" style="display:table-row"><img src="http://raw.githubusercontent.com/redbooth/free-file-icons/master/32px/${extension}.png" style="height: 32px; width:32px; margin-right: 8px;"><span style="display: table-cell; vertical-align: middle;">${file[0]}.${extension}</a>
          </div>
		  <div>${file[1]}</div>`;
      else if (extension && extension !== true)
        return `
          <div>
            <a href="${file[0]}.${extension}" target="_blank" style="display:table-row"><img src="http://raw.githubusercontent.com/redbooth/free-file-icons/master/32px/_blank.png" style="height: 32px; width:32px; margin-right: 8px;"><span style="display: table-cell; vertical-align: middle;">${file[0]}.${extension}</a>
          </div>
		  <div>${file[1]}</div>`;
      if (extension === true)
        //This means that the file has no extension...
        return `
          <div>
            <a href="${file[0]}" target="_blank" style="display:table-row"><img src="http://raw.githubusercontent.com/redbooth/free-file-icons/master/32px/_blank.png" style="height: 32px; width:32px; margin-right: 8px;"><span style="display: table-cell; vertical-align: middle;">${file[0]}</a>
          </div>
		  <div>${file[1]}</div>`;
      return `<div>${message}</div>`; //There's no file attached
  }
};

/* --------------------------------------------------  JOIN ALL COMPONENTS -------------------------------------------------- */
/* ---------------- Our main function where we process the file content and return the output of index.html ---------------- */
const convertFile = (contents) => {
  const regex = getRegex();

  /* Split text file using the appropriate regExp */
  const splitted = contents
    .split(regex)
    .filter(Boolean)
    .map((text) => text.replace(/[\r\n]+/g, "<br>"));

  const dates = getDates(splitted);
  const messages = getMessages(splitted);
  const usernames = getUsernames(splitted);
  const html = [htmlHeader];

  /* 
    An array of unique usernames, it should contain just two usernames and maybe something like 
    'Messages .... Tap for more info.
    our goal here is to extract one valid username and give it the class 'darker'
    so we could give it a different stylig
  */
  let uniqueUsernames = [...new Set(usernames)];
  var userOne = uniqueUsernames[uniqueUsernames.length - 1]; // the user that will take the classe 'darker'
  for (let i = 0; i < dates.length; i++) {
    let classe = "";
    if (usernames[i] == userOne) classe = "darker";
    let body = getBody(messages[i]);

    html.push(`
        <div class="container ${classe}">
          <div class="username">${usernames[i]}</div> 
          ${body}
          <div class="date">${dates[i]}</div>
        </div>`);
  }

  html.push(htmlFooter);
  return html.join("\n");
};

// Function to handle change of the input
function handleChange(event) {
  // Check whether the uploaded file is a text file or not
  allow = input.files[0].type.match("text/plain") ? true : false;

  // Extracting the title of the uploaded file to display it instead of "Upload file..."
  if (allow) {
    inputFileName = event.target.value.split("\\").pop();
    if (inputFileName) document.getElementsByTagName("label")[0].innerHTML = `<strong>${inputFileName}</strong>`;
    inputFileName = inputFileName.substring(0, inputFileName.lastIndexOf(".txt")) + ".html"; //Replace the .txt extension for the output file
  }

  if (!event.target.files || !allow) {
    // if the file doesn't exist or it's not a text file
    alert("You didn't upload a text file, please try again.");
    return;
  }

  downloadLink.hidden = true;
  readFile(event.target.files[0]).then((contents) => {
    const convertedFile = convertFile(contents);
    updateDownloadLink(createDownloadableUrl(convertedFile), inputFileName);
  });
}

async function handleZipFile(event) {
  console.log("got it");
  const file = event.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const zipData = new Uint8Array(arrayBuffer);

  // Unzip
  fflate.unzip(zipData, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    const dict = {};

    for (const [name, data] of Object.entries(files)) {
      // decode Uint8Array to string (assuming text files)
      const contents = new TextDecoder().decode(data);
      document.getElementById("zip-file-label").innerHTML = `<strong>${name}</strong>`;
      let fileName = name.substring(0, name.lastIndexOf(".txt")) + ".html";
      const convertedFile = convertFile(contents);
      dict[fileName] = convertedFile;
    }

    const encoder = new TextEncoder();
    const zipEntries = {};

    // Convert each string to Uint8Array
    for (const [filename, content] of Object.entries(dict)) {
      zipEntries[filename] = encoder.encode(content);
    }

    // Create zip
    const zipped = fflate.zipSync(zipEntries);

    // Trigger download
    const blob = new Blob([zipped], { type: "application/zip" });
    const url = URL.createObjectURL(blob);

    updateDownloadLink(url, "result.zip");
  });
}
