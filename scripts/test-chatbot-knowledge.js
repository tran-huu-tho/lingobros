/**
 * Test script for Chatbot Knowledge Base
 * Run: node scripts/test-chatbot-knowledge.js
 */

const testQuestions = [
  {
    category: "FAQ - System",
    questions: [
      "LingoBros là gì?",
      "Có những tính năng gì?",
      "Miễn phí không?",
      "Cần đăng ký không?"
    ]
  },
  {
    category: "FAQ - Learning",
    questions: [
      "Làm sao bắt đầu học?",
      "Cấu trúc bài học như thế nào?",
      "Các loại bài tập có gì?",
      "Lesson bị khóa, mở như thế nào?"
    ]
  },
  {
    category: "FAQ - Gamification",
    questions: [
      "XP là gì?",
      "Hearts là gì?",
      "Hết hearts thì sao?",
      "Streak là gì?",
      "Làm sao lên top leaderboard?"
    ]
  },
  {
    category: "FAQ - Chatbot",
    questions: [
      "Frosty là ai?",
      "Frosty có thể làm gì?",
      "Chat với Frosty có mất phí không?",
      "Guest có chat được không?"
    ]
  },
  {
    category: "Technical Questions",
    questions: [
      "Database có những model nào?",
      "API nào dùng để lấy courses?",
      "Exercise có những loại nào?",
      "UserProgress lưu những gì?",
      "Gamification hoạt động như thế nào?"
    ]
  },
  {
    category: "English Learning",
    questions: [
      "Phân biệt affect và effect?",
      "Cách dùng present perfect?",
      "Sửa lỗi: He go to school everyday",
      "Giải thích idiom break a leg"
    ]
  }
];

async function testChatbot() {
  console.log('🤖 Testing Frosty Chatbot Knowledge Base\n');
  console.log('=' .repeat(60));

  for (const category of testQuestions) {
    console.log(`\n📂 ${category.category}`);
    console.log('-'.repeat(60));

    for (const question of category.questions) {
      console.log(`\n❓ Question: ${question}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: question })
        });

        const data = await response.json();
        
        if (data.message) {
          console.log(`✅ Frosty: ${data.message}`);
          if (data.isFAQ) {
            console.log('   [FAQ Instant Response]');
          }
        } else if (data.error) {
          console.log(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
      }

      // Delay để tránh spam API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!');
}

// Test với context
async function testWithContext() {
  console.log('\n🎯 Testing with Context\n');
  console.log('=' .repeat(60));

  const contextTests = [
    {
      message: "Giải thích câu này cho tôi",
      contextType: "lesson",
      contextData: {
        lessonTitle: "Present Simple Tense",
        lessonType: "grammar",
        exercisesCompleted: 3,
        totalExercises: 8
      }
    },
    {
      message: "Tại sao đáp án này sai?",
      contextType: "exercise",
      contextData: {
        exerciseType: "multiple-choice",
        question: "How are you?",
        isCorrect: false
      }
    },
    {
      message: "Giải thích thêm về từ này",
      contextType: "vocabulary",
      contextData: {
        word: "elaborate"
      }
    }
  ];

  for (const test of contextTests) {
    console.log(`\n❓ Question: ${test.message}`);
    console.log(`   Context: ${test.contextType}`);
    console.log(`   Data: ${JSON.stringify(test.contextData)}`);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test)
      });

      const data = await response.json();
      
      if (data.message) {
        console.log(`✅ Frosty: ${data.message}`);
      } else if (data.error) {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n' + '='.repeat(60));
}

// Run tests
async function main() {
  console.log('🚀 Starting Chatbot Knowledge Base Tests\n');
  
  // Check if server is running
  try {
    await fetch('http://localhost:3000/api/chat', { method: 'GET' });
  } catch (error) {
    console.log('❌ Server is not running!');
    console.log('Please start the server first: npm run dev');
    process.exit(1);
  }

  // Run basic tests
  await testChatbot();

  // Run context tests
  await testWithContext();

  console.log('\n✨ All tests completed!\n');
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testChatbot, testWithContext };
