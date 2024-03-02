import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readAllComments, createComments, updateComments, deleteComments, getCommentById, getCommentByComId } from './db.comments.js';

const router = express.Router();

// READ ALL Comments
router.get('/comment', async (req, res) => {

    const { success, data } = await readAllComments();

    if (success) {
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" });
})

// READ Comments by Comment ID
router.get('/commentById/:commentId', async (req, res) => {

    try {
        const commentId = req.params.commentId;
        // console.log(commentId);
        const { success, data } = await getCommentByComId(commentId);

        if (success) {
            return res.json({ success, data });
        } else {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
    } catch (error) {
        console.error('Error fetching comment:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

})

// READ Comments by Post ID
router.get('/comment/:postId', async (req, res) => {

    try {
        const postId = req.params.postId;
        // console.log(postId);
        const { success, data } = await getCommentById(postId);

        if (success) {
            return res.json({ success, data });
        } else {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
    } catch (error) {
        console.error('Error fetching comment:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

})

// Create Comment
router.post('/comment', async (req, res) => {

    const { message, userId, postId } = req.body;

    try {
        const newComment = {
            id: uuidv4(),
            message,
            timestamp: new Date().toISOString(),
            postId,
            userId,
        };
        // console.log(newComment);

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
    const { postId } = req.body;

    try {

        const result = await deleteComments(commentId, postId);

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