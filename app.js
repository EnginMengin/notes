require("dotenv").config()
const express = require("express")
const path = require("path")
const app = express()
const ejsLayouts = require("express-ejs-layouts")
const bodyParser = require("body-parser")
const connectDB = require("./server/config/db")
const cookieParser = require("cookie-parser")
const methodOverride = require("method-override")

connectDB()

app.use(express.static("public"))
app.use(cookieParser())

app.use(methodOverride("_method"))

app.set("views", path.join(__dirname, "views"))

app.use(ejsLayouts)
app.set("view engine", "ejs")
app.set("layout", "layouts/main")


app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())


app.use("/", require("./server/routes/main"))


app.listen(3000, () => {
    console.log("server listening")
})