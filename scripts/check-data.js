const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lingobros');
    const db = mongoose.connection.db;

    console.log('=== COURSES ===');
    const coursesCount = await db.collection('courses').countDocuments();
    console.log('Total courses:', coursesCount);
    const sampleCourses = await db.collection('courses').find().limit(2).toArray();
    console.log(JSON.stringify(sampleCourses, null, 2));

    console.log('\n=== TOPICS ===');
    const topicsCount = await db.collection('topics').countDocuments();
    console.log('Total topics:', topicsCount);
    const sampleTopics = await db.collection('topics').find().limit(2).toArray();
    console.log(JSON.stringify(sampleTopics, null, 2));

    console.log('\n=== QUIZZES ===');
    const quizzesCount = await db.collection('quizzes').countDocuments();
    console.log('Total quizzes:', quizzesCount);
    const sampleQuizzes = await db.collection('quizzes').find().limit(2).toArray();
    console.log(JSON.stringify(sampleQuizzes, null, 2));

    console.log('\n=== LEARNING PATHS ===');
    const paths = await db.collection('learningpaths').find().toArray();
    console.log('Total paths:', paths.length);
    console.log(JSON.stringify(paths, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
