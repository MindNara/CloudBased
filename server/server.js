import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import user from './routes/users/users.js'
import post from './routes/posts/posts.js'
import review from './routes/reviews/reviews.js'

dotenv.config()

const app = express()

app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.json({ "Hi": "Hello World" })
})

app.use(user)
app.use(post)
app.use(review)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Start server at http://localhost:${PORT}`)
})
