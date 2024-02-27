import { db } from '../../db.config.js'
import { ScanCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

// Read all Subject
const readAllCourses = async () => {
    try {
        const { Items = [] } = await db.send(new ScanCommand({
            TableName: 'courses'
        }));
        return { success: true, data: Items };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
};

// Get Detail Course by subject_Id
const readCourseDetail = async (subjectId) => {
    try {
        const { Item } = await db.send(new GetItemCommand({
            TableName: 'courses',
            Key: {
                subject_id: { S: subjectId },
            },
        }));
        return { success: true, data: Item };
    } catch (error) {
        console.error(error);
        return { success: false, data: null };
    }
}

export {
    readAllCourses,
    readCourseDetail,
}