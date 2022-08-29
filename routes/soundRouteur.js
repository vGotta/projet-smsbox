const Router = require('express').Router
const multer = require("multer")
const streamifier = require('streamifier');
let fs = require('fs')
const FormData = require('form-data');
const fetch = require('node-fetch');
const soundRouter = Router()
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/uploads/sounds')
    },
    filename: function (req, file, cb) {
        file.originalname = file.originalname.split(' ').join('');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    },
})

const upload = multer({
    storage: storage, fileFilter(req, file, cb) {
        if (file.mimetype == 'audio/mp3' || file.mimetype == 'audio/wma' || file.mimetype == 'audio/vnd.wav' || file.mimetype == 'audio/ogg') {
            cb(null, true)
        }
        else {
            req.fileValidationError = "Ce type de fichier n'est pas autorisé";
            cb(null, false);
        }
    }
})

soundRouter.get('/', async (req, res) => {
    try {
        fetch("https://api.smsbox.net/vmm/1.0/json/list", {
            headers: {
                Authorization: process.env.API_KEY
            },
            method: "GET",
        }).then(response => response.json())
            .then(response => {
                res.render("pages/listsoundsapi.twig", {
                    sounds: response.file_list
                })
            })
    } catch (error) {
        res.send(error);
    }
});

soundRouter.get('/sendmessagetel/:file_id', async (req, res) => {
    try {
        res.render("pages/formsendapi.twig", {
            file_id: req.params.file_id
        })
    } catch (error) {
        res.send(error);
    }
});

soundRouter.get('/sendfiletoapi', async (req, res) => {
    try {
        res.render("pages/formaddsound.twig", {
        })
    } catch (error) {
        res.send(error);
    }
});

soundRouter.post('/sendsoundapi', upload.single('file'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            res.redirect('/')
        }
        const formData = new FormData();
        formData.append('file', fs.createReadStream('./assets/uploads/sounds/' + req.file.filename));
        formData.append('user_reference', req.body.user_reference);
        fetch("https://api.smsbox.net/vmm/1.0/json/import", {
            headers: {
                Authorization: process.env.API_KEY
            },
            method: "POST",
            body: formData
        }).then(response => response.json())
            .then(response => {
                fs.unlinkSync('./assets/uploads/sounds/' + req.file.filename)
                res.json(response)
            })
    } catch (error) {
        fs.unlinkSync('./assets/uploads/sounds/' + req.file.filename)
        console.log(error);
    }
})
soundRouter.get('/findSounds', upload.single('file'), async (req, res) => {
    try {
        let files = await fetch("https://api.smsbox.net/vmm/1.0/json/list", {
            headers: {
                Authorization: process.env.API_KEY
            },
            method: "GET",
        }).then(response => response.json())
            .then(response => {

            })
    } catch (error) {
        console.log(error);
    }
})

soundRouter.post('/repSounds/:file_id', async (req, res) => {
    try {
        req.body.tel = [req.body.tel]
        fetch(`https://api.smsbox.net/vmm/1.0/json/send?recipients=${req.body.tel}&file_id=${req.params.file_id}`, {
            headers: {
                Authorization: process.env.API_KEY
            },
            method: "POST",
        }).then(response => response.json())
            .then(response => {
                console.log(response);
                res.redirect('/')
            })
    } catch (error) {
        console.log(error);
    }
})
module.exports = soundRouter