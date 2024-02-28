import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createUsers } from './db.auth.js';
import { db } from '../../db.config.js';
import 'dotenv/config';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {

    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            id: uuidv4(),
            email,
            password: hashedPassword
        };

        const result = await createUsers(user);

        if (result.success) {
            return res.json({ success: true, data: result.data });
        } else {
            return res.status(500).json({ success: false, message: 'Registration failed' });
        }

    } catch (error) {
        console.error('Registration failed: ', error);
        return res.status(500).json({ success: false, message: "Registration failed" });
    }

})

// Login
router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const params = {
            TableName: 'users',
            Key: { email: { S: email } },
        };

        const command = new GetItemCommand(params);

        const result = await db.send(command);
        if (!result.Item) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const checkPassword = await bcrypt.compare(password, result.Item.password.S);
        if (!checkPassword) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // Generate token
        const token = jwt.sign({ id: result.Item.id }, 'your-secret-key', {
            expiresIn: '1h',
        });

        res.status(200).json({ token, user: result.Item });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

export default router