import express from 'express'
import { readAllUsers } from './db/db.users.js'

const router = express.Router()

// READ ALL Users
router.get('/users', async (req, res) => {
    const { success, data } = await readAllUsers()

    if (success) {
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" })
})

export default router