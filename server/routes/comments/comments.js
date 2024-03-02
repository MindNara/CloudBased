import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readAllComments, createComments, updateComments, deleteComments } from './db.comments.js';

const router = express.Router();

// READ ALL Comments
router.get('/comment', async (req, res) => {

    const { success, data } = await readAllComments();

    if (success) {
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" });
})

// Create Comment
router.post('/comment', async (req, res) => {

    try {
        const { message, userId, postId } = req.body;

        const newComment = {
            id: uuidv4(),
            message,
            timestamp: new Date().toISOString(),
            postId,
            userId,
        };

        const result = await createComments(newComment);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Create review failed', data: newComment });
        }

    } catch (error) {
        console.error('Create review failed: ', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

// Update Comment
router.put('/comment/:commentId', async (req, res) => {

    const commentId = req.params.commentId;
    const { message } = req.body;

    try {
        const updatedComment = {
            id: commentId,
            message: message,
            timestamp: new Date().toISOString(),
        };

        const result = await updateComments(updatedComment);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Update comment failed' });
        }
    } catch (error) {
        console.error('Update comment failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

// Delete Comment
router.delete('/comment/:commentId', async (req, res) => {

    const commentId = req.params.commentId;

    try {

        const result = await deleteComments(commentId);

        if (result.success) {
            return res.json({ success: true, message: 'Delete Comment ID ' + ' successful' });
        } else {
            return res.status(500).json({ success: false, message: 'Delete Comment failed' });
        }
    } catch (error) {
        console.error('Delete failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

export default router