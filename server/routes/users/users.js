import express from 'express'
import { readAllUsers } from './db.users.js'

const router = express.Router()

// READ ALL Users
router.get('/user', async (req, res) => {
    const { success, data } = await readAllUsers()

    if (success) {
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" })
})

// GET User by ID
router.get('/user/:userId', async (req, res) => {

    const postId = req.params.postId;

    // if (success) {
    //     return res.json({ success, data })
    // }
    // return res.status(500).json({ success: false, messsage: "Error" })
})

export default router