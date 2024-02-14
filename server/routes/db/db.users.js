import { db } from '../../db.config.js'
import { ScanCommand } from '@aws-sdk/client-dynamodb';

// Read all users
const readAllUsers = async () => {
    const params = {
        TableName: 'users'
    };

    try {
        const { Items = [] } = await db.send(new ScanCommand(params));
        return { success: true, data: Items };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};


export {
    readAllUsers,
}