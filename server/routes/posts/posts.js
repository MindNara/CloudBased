import express from 'express';
import { readAllPosts, createPosts, updatePosts, deletePosts } from './db.posts.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const router = express.Router();

// READ ALL Posts
router.get('/post', async (req, res) => {
    const { success, data } = await readAllPosts();

    if (success) {
        return res.json({ success, data })
    }
    return res.status(500).json({ success: false, messsage: "Error" });
})

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CREATE Posts
router.post('/post', upload.array('image'), async (req, res) => {

    try {
        const { title, detail } = req.body;
        const images = req.files.map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
        }));

        const newPost = {
            id: uuidv4(),
            title,
            detail,
            image: images.map(image => image.originalname),
            timestamp: new Date().toISOString(),
        };

        const result = await createPosts(newPost);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Create post failed' });
        }

    } catch (error) {
        console.error('Create post failed: ', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
})

// UPDATE Posts by ID
router.put('/post/:postId', async (req, res) => {

    const postId = req.params.postId;
    const { title, detail } = req.body;

    try {
        const updatedPost = {
            id: postId,
            title: title,
            detail: detail,
            timestamp: new Date().toISOString(),
        };

        const result = await updatePosts(updatedPost);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Update post failed' });
        }
    } catch (error) {
        console.error('Update post failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

// DELETE Posts by ID
router.delete('/post/:postId', async (req, res) => {

    const postId = req.params.postId;

    try {

        const result = await deletePosts(postId);

        if (result.success) {
            return res.json({ success: true, message: 'Delete Post ID ' + postId + ' successful' });
        } else {
            return res.status(500).json({ success: false, message: 'Delete post failed' });
        }
    } catch (error) {
        console.error('Delete failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

export default router