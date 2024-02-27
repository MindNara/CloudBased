import express from 'express'
import { readAllCourses, readCourseDetail } from './db.courses.js'

const router = express.Router()

// READ ALL Subjects
router.get('/review', async (req, res) => {
    const { success, data } = await readAllCourses()

    if (success) {
        // const details = data.map(course => course.detail)

        // return res.json({ success, data: details })
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" })
})

// Get Detail Course by subject_Id
router.get('/review/:reviewId', async (req, res) => {

    const reviewId = req.params.reviewId;
    const { success, data } = await readCourseDetail(reviewId);

    if (success) {
        return res.json({ success: true, data });
    }
    return res.status(500).json({ success: false, messsage: "Error" })

})

export default router