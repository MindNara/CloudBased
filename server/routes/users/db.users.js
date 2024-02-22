import { db } from '../../db.config.js'
import { ScanCommand } from '@aws-sdk/client-dynamodb';

// Read all users
const readAllUsers = async () => {
    try {
        const { Items = [] } = await db.send(new ScanCommand({
            TableName: 'users'
        }));
        return { success: true, data: Items };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};

export {
    readAllUsers,
}