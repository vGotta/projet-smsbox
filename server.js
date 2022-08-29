const express = require("express")
const mongoose = require("mongoose")
const  soundRouter = require("./routes/soundRouteur")
const app = express()
require('dotenv').config()

app.use(express.static('./assets'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.Router())
app.use(soundRouter)

app.listen(process.env.PORT, function(err){
    if (err) {
        console.log(err);
    }else{
        console.log(`connected to ${process.env.APP_URL}`);
    }
})
