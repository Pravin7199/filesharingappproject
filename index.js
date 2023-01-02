const express = require('express');

const bodyparser = require('body-parser');

const rimraf = require('rimraf')

const path = require('path')

const fs = require('fs')

const multer = require('multer');

var uploadsDir = __dirname + "/public/uploads";

setInterval(() => {
    fs.readdir(uploadsDir, function (err, files) {
        files.forEach(function (file, index) {
            fs.stat(path.join(uploadsDir, file), function (err, stat) {
                var endTime, now;
                if (err) {
                    return console.error(err);
                }
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + 3600000 * 24;
                if (now > endTime) {
                    return rimraf(path.join(uploadsDir, file), function (err) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("Successfully Deleted")
                    })
                }
            })
        })
    })
}, 60000);




const { request } = require('http');

const app = express()

app.use(express.static(path.join(__dirname + "public/uploads")))

app.use(bodyparser.urlencoded({ extended: false }))

app.use(bodyparser.json())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});


const upload = multer({ storage: storage }).single('file')


const PORT = process.env.PORT || 5000

//view engine ejs

app.set('view engine', "ejs")

//open home page

app.get('/', (req, res) => {
    res.render('index')
})

//make the upload post request 
app.post('/uploadfile', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(req.file.path)

            res.json({
                path: req.file.filename
            })
        }
    })
})

//get request to download the individual file name 

app.get('/files/:id', (req, res) => {
    console.log(req.params.id)

    res.render('displayfile', { path: req.params.id })
})

app.get('/download', (req, res) => {
    var pathoutput = req.query.path;
    console.log(pathoutput);
    var fullpath = path.join(__dirname, pathoutput);
    res.download(fullpath, (err) => {
        if (err) {
            res.send(err);
        }
    });
});


app.listen(PORT, () => {
    console.log("app is listening on port 5000")
})