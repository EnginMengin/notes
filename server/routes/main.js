const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Note = require("../models/Note")
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")
const userAuth = require("../middleware/userAuth")


router.use((req, res, next) => {
    const token = req.cookies.token
    if (token) {
        const decoded = JWT.verify(token, process.env.SECRET_KEY)

        res.locals.name = decoded.name
        res.locals.email = decoded.email
        res.locals.password = decoded.password
        res.locals.userId = decoded.userId
    } else {
        console.log("token bulunamadı")
    }
    next()
})

router.get("/", (req, res) => {
    locals = {
        title: "Ana Sayfa | Notes App"
    }
    res.render("index", locals)
})

router.get("/register", (req, res) => {
    locals = {
        title: "Kayıt ol | Notess App"
    }
    res.render("register", locals)
})

router.get("/login", (req, res) => {
    locals = {
        title: "Giriş Yap | Notes App"
    }
    res.render("login", locals)
})

router.get("/home", userAuth, async (req, res) => {
    locals = {
        title: "Ana Sayfa | Notes App"
    }
    try {
        const user = await User.findById(res.locals.userId);


        res.render("home", { locals, user })

    } catch (error) {
        console.log(error)
    }

})

router.get("/profile", userAuth, async (req, res) => {
    locals = {
        title: "Profil | Notes App"
    }
    const user = await User.findById(res.locals.userId)


    const sumNote = user.notes ? user.notes.length : []
    res.render("profile", { locals, sumNote })
})

router.get("/add/note", userAuth, (req, res) => {
    locals = {
        title: "Not Ekle | Notes App"
    }
    res.render("add-note", locals)
})

router.get("/note", userAuth, (req, res) => {
    locals = {
        title: "Not 1 | Notes App"
    }
    res.render("note", locals)
})

router.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/login")
})

router.get("/note/:id", async (req, res) => {
    const id = req.params.id

    const user = await User.findById(res.locals.userId)

    const foundNote = user.notes.find(note => note._id.toString() === id)

    res.render("note", { foundNote })
})




router.get("/edit/:id", async (req, res) => {
    const { id } = req.params
    locals = {
        title: "Edit Not | Notes App"
    }
    const user = await User.findById(res.locals.userId)
    if (!user.notes) {
        user.notes = []
    }
    const foundNote = user.notes.find(note => note._id.toString() === id)


    res.render("edit", { locals, foundNote })
})



router.post("/register", async (req, res) => {

    const { name, email, password } = req.body

    try {

        if (!name && !email && !password) {
            res.status(404).json({ message: "Lütfen Formu Doldurunuz" })
        }

        try {
            const existingUser = await User.findOne({ name: name })
            if (existingUser) {
                res.status(404).json({ message: "kullanıcı zaten var" })
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = new User({ name, email, password: hashedPassword })
            await newUser.save()


        } catch (error) {
            res.status(404).json("kullanıcı bulunamadı")
            console.log(error)
        }
        res.status(201).redirect("/login")

    } catch (error) {
        console.log(error)
    }

})

router.post("/login", async (req, res) => {

    const { name, password } = req.body
try {
    const user = await User.findOne({ name })
    try {
        
    if (!user) {
        res.status(404).json({ message: "kullanıcı bulunamadı" })
    }
    } catch (error) {
        res.status(404).json({message: "kullanıcı bulunamadı"})
    }

    if (name === "" && password === "") {
        res.status(404).json({ message: "Lutfen formu doldurunuz" })
    }
    if (name === "" || password === "") {
        res.status(404).json({ message: "Lutfen formu doldurunuz" })
    }


    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        res.status(404).json({ message: "şifreniz yanlış" })
    }
    const token = JWT.sign({
        userId: user.id,
        name: user.name,
        email: user.email,
        password: password
    },
        process.env.SECRET_KEY,
    );

    res.cookie("token", token, { httpOnly: true })

    res.redirect("/home")
} catch (error) {
    console.log(error)
}
  
})




router.post("/add/note", async (req, res) => {
    const { title, content } = req.body

    const user = await User.findById(res.locals.userId)

    console.log(user)

    try {
        user.notes.push({ title, content })
        await user.save()
        res.redirect("/home")

    } catch (error) {
        console.log(error)
        res.status(404).json({ message: "bir sorun oluştu" })
    }


})


router.post("/add/note", async (req, res) => {
    const { title, content } = req.body

    const user = await User.findById(res.locals.userId)

    console.log(user)

    try {
        user.notes.push({ title, content })
        await user.save()

    } catch (error) {
        console.log(error)
        res.status(404).json({ message: "bir sorun oluştu" })
    }


    res.redirect("/home")
})




router.post("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(res.locals.userId)
        const noteId = req.params.id
        const { title, content } = req.body

        const note = user.notes.find(note => note._id.toString() === noteId)

        note.title = title || note.title
        note.content = content || note.content

        user.save()
        res.redirect(`/note/${noteId}`)
    } catch (error) {
        console.log(error)
    }
})



router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await User.findById(res.locals.userId)
        const noteId = req.params.id

        user.notes = user.notes.filter(note => note._id.toString() !== noteId)

        user.save()
        res.redirect("/home")
    } catch (error) {
        console.log(error)
    }
})



module.exports = router