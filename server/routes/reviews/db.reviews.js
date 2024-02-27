// import { db } from '../../db.config.js'
// import { ScanCommand } from '@aws-sdk/client-dynamodb';

// // Read all users
// const readAllCourses = async () => {
//     try {
//         const { Items = [] } = await db.send(new ScanCommand({
//             TableName: 'courses'
//         }));
//         return { success: true, data: Items };
//     } catch (error) {
//         console.error(error);
//         return { success: false, data: null };
//     }
// };

// export {
//     readAllCourses,
// }