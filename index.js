const express = require("express");
const bodyParser = require("body-parser");
const ffmpeg = require("fluent-ffmpeg");
const fileUpload = require("express-fileupload");
const app = express();

ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin");

ffmpeg.setFlvtoolPath("C:/flvtool");

console.log(ffmpeg);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/convert", (req, res) => {

    let to = req.body.to;
    let file = req.files.file;
    let fileName = `output.${to}`;
    console.log(to);
    console.log(file);
  
    file.mv("tmp/" + file.name, function (err) {
      if (err) return res.sendStatus(500).send(err);
      console.log("File Uploaded successfully");
    });
  
    ffmpeg("tmp/" + file.name)
      .withOutputFormat(to)
      .on("end", function (stdout, stderr) {
        console.log("Finished");
        res.download(__dirname + fileName, function (err) {
          if (err) throw err;
  
          fs.unlink(__dirname + fileName, function (err) {
            if (err) throw err;
            console.log("File deleted");
          });
        });
        fs.unlink("tmp/" + file.name, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
      })
      .on("error", function (err) {
        console.log("an error happened: " + err.message);
        fs.unlink("tmp/" + file.name, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
      })
      .saveToFile(__dirname + fileName);
  });

app.listen(5000);