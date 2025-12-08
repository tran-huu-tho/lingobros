const mongoose = require('mongoose');

async function updateExerciseQuestions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lingobros');
    console.log('✅ Connected to MongoDB');

    const Exercise = mongoose.connection.db.collection('exercises');
    const Topic = mongoose.connection.db.collection('topics');

    // Lấy tất cả topics
    const topics = await Topic.find({}).toArray();
    const topicMap = new Map(topics.map(t => [t._id.toString(), t]));

    // Lấy tất cả exercises
    const exercises = await Exercise.find({}).toArray();

    let updateCount = 0;

    for (const exercise of exercises) {
      const topic = topicMap.get(exercise.topicId.toString());
      const topicTitle = topic ? topic.title : '';
      
      let newQuestion = exercise.question;

      switch (exercise.type) {
        case 'multiple-choice':
          // Kiểm tra xem có phải câu hỏi từ vựng không
          if (exercise.correctAnswer && exercise.options) {
            // Nếu correctAnswer là tiếng Việt
            const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(exercise.correctAnswer);
            
            if (isVietnamese) {
              // Tìm từ tiếng Anh trong options
              const englishWord = exercise.options.find(opt => 
                !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(opt) && opt !== exercise.correctAnswer
              );
              if (englishWord) {
                newQuestion = `Nghĩa của từ "${englishWord}" là:`;
              } else {
                newQuestion = `Chọn đáp án đúng về "${topicTitle}":`;
              }
            } else {
              // Dịch từ tiếng Việt sang tiếng Anh
              const vietnameseWord = exercise.options.find(opt => 
                /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(opt) && opt !== exercise.correctAnswer
              );
              if (vietnameseWord) {
                newQuestion = `Từ "${vietnameseWord}" trong tiếng Anh là:`;
              } else {
                newQuestion = `Chọn đáp án đúng về "${topicTitle}":`;
              }
            }
          }
          break;

        case 'fill-blank':
          if (exercise.sentence) {
            newQuestion = `Điền từ còn thiếu vào câu:`;
          }
          break;

        case 'word-order':
          newQuestion = `Sắp xếp các từ sau thành câu hoàn chỉnh:`;
          break;

        case 'translate':
          // Kiểm tra xem có phải dịch từ tiếng Anh sang tiếng Việt không
          if (exercise.correctAnswer && exercise.options) {
            // Nếu correctAnswer là tiếng Việt (có dấu)
            const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(exercise.correctAnswer);
            
            if (isVietnamese) {
              // Tìm từ tiếng Anh trong options
              const englishWord = exercise.options.find(opt => 
                !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(opt)
              );
              if (englishWord) {
                newQuestion = `Nghĩa của từ "${englishWord}" là:`;
              }
            } else {
              // Dịch từ tiếng Việt sang tiếng Anh
              const vietnameseWord = exercise.options.find(opt => 
                /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(opt)
              );
              if (vietnameseWord) {
                newQuestion = `Từ "${vietnameseWord}" trong tiếng Anh là:`;
              }
            }
          }
          break;

        case 'match':
          newQuestion = `Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:`;
          break;
      }

      if (newQuestion !== exercise.question) {
        await Exercise.updateOne(
          { _id: exercise._id },
          { $set: { question: newQuestion } }
        );
        updateCount++;
        console.log(`Updated: ${exercise.type} - ${newQuestion}`);
      }
    }

    console.log(`\n✅ Updated ${updateCount} exercises`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateExerciseQuestions();
