import express from 'express';
import { readAllPosts, createPosts, updatePosts, deletePosts } from './db.posts.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { s3 } from '../../s3.config.js';
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
        const images = req.files;

        const imageUploadPromises = images.map(async (file) => {
            const params = {
                Bucket: 'file-upload-cloud-project',
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const command = new PutObjectCommand(params);
            await s3.send(command);

            const imageUrl = `https://file-upload-cloud-project.s3.amazonaws.com/${encodeURIComponent(file.originalname)}`;
            return imageUrl;
        });
        const imageUrls = await Promise.all(imageUploadPromises);

        const newPost = {
            id: uuidv4(),
            title,
            detail,
            image: imageUrls,
            timestamp: new Date().toISOString(),
            like: 0,
            comment: 0,
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