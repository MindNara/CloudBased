import express from 'express'
import { readAllCourses, readCourseDetail } from './db.courses.js'
import { readAllReviews, createReviews, deleteReviews, updateReviews } from './db.reviews.js'
import { v4 as uuidv4 } from 'uuid';

const router = express.Router()

// READ ALL Subjects
router.get('/course', async (req, res) => {
    const { success, data } = await readAllCourses()

    if (success) {
        // const details = data.map(course => course.detail)

        // return res.json({ success, data: details })
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" })
})

// Get Detail Course by subject_Id
router.get('/course/:subjectId', async (req, res) => {

    const subjectId = req.params.subjectId;
    const { success, data } = await readCourseDetail(subjectId);

    if (success) {
        return res.json({ success: true, data });
    }
    return res.status(500).json({ success: false, messsage: "Error" })

})

// READ ALL Review by subject_id
router.get('/review/:subjectId', async (req, res) => {
    const subjectId = req.params.subjectId;
    const { success, data } = await readAllReviews(subjectId);

    if (success) {
        return res.json({ success, data });
    }
    return res.status(500).json({ success: false, messsage: "Error" })
})

// Create Review
router.post('/review/:subjectId', async (req, res) => {

    const subjectId = req.params.subjectId;
    try {
        const { detail, grade, rating, userId } = req.body;

        const newReview = {
            id: uuidv4(),
            detail,
            grade,
            rating,
            timestamp: new Date().toISOString(),
            subjectId,
            userId,
        };

        const result = await createReviews(newReview);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Create review failed', data: newReview });
        }

    } catch (error) {
        console.error('Create review failed: ', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

// Delete Review
router.delete('/review/:reviewId', async (req, res) => {

    const reviewId = req.params.reviewId;

    try {

        const result = await deleteReviews(reviewId);

        if (result.success) {
            return res.json({ success: true, message: 'Delete Review ID ' + ' successful' });
        } else {
            return res.status(500).json({ success: false, message: 'Delete Review failed' });
        }
    } catch (error) {
        console.error('Delete failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

// Update Review
router.put('/review/:reviewId', async (req, res) => {

    const reviewId = req.params.reviewId;
    const { detail, grade, rating } = req.body;

    try {
        const updatedReview = {
            review_id: reviewId,
            detail: detail,
            grade: grade,
            rating: rating,
            timestamp: new Date().toISOString(),
        };

        const result = await updateReviews(updatedReview);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Update review failed' });
        }
    } catch (error) {
        console.error('Update review failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

export default router