const JWT = require("jsonwebtoken")

const userAuth = (req, res, next) => {

    const token = req.cookies.token
    if(!token) {
        res.status(404).json({message: "Lütfen Kayıt olunuz"})
    }

    next()
}

module.exports = userAuth