const multer = require('multer')
const express = require('express');
const fs = require('fs');
const app = express();

const tmpPath = './tmp/';
const uploadPath = './upload/';
const nameRegex = /^[a-zA-Z0-9]{4,100}$/



let upload = multer({ dest: tmpPath, limits: { fileSize: 52428800 } })


app.get('/', (req, res) => {
  res.send('hello world');
});


app.post('/upload/:roomId', upload.single('file'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  // console.log(req);
  if (req.file != null) {
    if (req.params.roomId.match(nameRegex)) {
      //console.log(req.file.filename.match(nameRegex));
      //console.log("filename : " + req.file.filename);
      //console.log(req.params.roomId + " match");

      fs.mkdir(uploadPath + req.params.roomId, { recursive: true }, (dirErr) => {
        if (dirErr) {
          console.error(dirErr);
          res.sendStatus(500);

        } else {
          console.log("Directory is created.");

          fs.rename(req.file.path, uploadPath + req.params.roomId + '/' + req.file.filename, function (err) {
            if (err) {
              //throw err
              console.error(err)
              res.sendStatus(500);

            } else {
              console.log("Successfully moved the file!");


              try {
                res.send(req.file);
              } catch (httpErr) {
                console.error(httpErr);
                res.sendStatus(400);

              }
            }
          });
        }
      });

    } else {
      console.log(req.params.roomId + " not match");
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(400);
    //console.log("file null");
  }

});

app.get('/download/:roomId/:id', function (req, res) {

  if ((req.params.id.match(nameRegex)) && (req.params.roomId.match(nameRegex))) {
    res.download(uploadPath + req.params.roomId + '/' + req.params.id, 'file', function (err) {
      if (err) {
        // Handle error, but keep in mind the response may be partially-sent
        // so check res.headersSent
        console.log(err)
        res.sendStatus(404);

      } else {
        // decrement a download credit, etc.
      }
    }
    );
  } else {
    console.log(req.params.roomId + " not match");
    console.log(req.params.id + " not match");

    res.sendStatus(400);
  }

});

app.delete('/delete/:roomId', function (req, res) {
  console.log('request' + req.params.roomId);
  if (req.params.roomId.match(nameRegex)) {
    fs.rm(uploadPath + req.params.roomId, { recursive: true }, function (err) {
      if (err) {
        res.sendStatus(404);
        console.error(err)
      } else {
        res.sendStatus(200);

      }
    });
  } else {
    console.log(req.params.roomId + " not match");
    res.sendStatus(400);
  }
});
app.listen(3000, () => {
  console.log('Started on port 3000');
});
