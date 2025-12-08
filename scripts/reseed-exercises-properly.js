const mongoose = require('mongoose');

async function reseedExercises() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lingobros');
    console.log('✅ Connected to MongoDB');

    const Exercise = mongoose.connection.db.collection('exercises');
    const Topic = mongoose.connection.db.collection('topics');

    // Xóa tất cả bài tập cũ
    await Exercise.deleteMany({});
    console.log('🗑️  Cleared old exercises');

    // Lấy tất cả topics
    const topics = await Topic.find({}).toArray();
    console.log(`📚 Found ${topics.length} topics`);

    const exercises = [];
    let order = 1;

    for (const topic of topics) {
      const topicId = topic._id;
      const topicTitle = topic.title;

      // Tạo 5 bài tập cho mỗi chủ đề
      let topicExercises = [];

      switch (topicTitle) {
        case 'Giới thiệu bản thân':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "name" là:',
              options: ['Tên', 'Tuổi', 'Nghề nghiệp', 'Quê quán'],
              correctAnswer: 'Tên',
              explanation: '"Name" nghĩa là tên.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'My name ___ John.',
              blanks: [{ position: 2, answer: 'is', acceptableAnswers: ['is'] }],
              explanation: 'Dùng "is" cho ngôi thứ ba số ít.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['I', 'am', 'from', 'Vietnam'],
              correctOrder: ['I', 'am', 'from', 'Vietnam'],
              explanation: 'Cấu trúc: I am from + địa danh.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "introduce" là:',
              options: ['Giới thiệu', 'Học tập', 'Làm việc', 'Chơi'],
              correctAnswer: 'Giới thiệu',
              explanation: '"Introduce" nghĩa là giới thiệu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'hello', right: 'xin chào' },
                { left: 'name', right: 'tên' },
                { left: 'age', right: 'tuổi' },
                { left: 'from', right: 'từ' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Sinh hoạt hằng ngày':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "breakfast" là:',
              options: ['Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Bữa phụ'],
              correctAnswer: 'Bữa sáng',
              explanation: '"Breakfast" nghĩa là bữa sáng.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I wake ___ at 6 AM every day.',
              blanks: [{ position: 2, answer: 'up', acceptableAnswers: ['up'] }],
              explanation: '"Wake up" nghĩa là thức dậy.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['I', 'brush', 'my', 'teeth', 'daily'],
              correctOrder: ['I', 'brush', 'my', 'teeth', 'daily'],
              explanation: 'Cấu trúc: Chủ ngữ + động từ + tân ngữ + trạng từ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "sleep" là:',
              options: ['Ngủ', 'Ăn', 'Uống', 'Chơi'],
              correctAnswer: 'Ngủ',
              explanation: '"Sleep" nghĩa là ngủ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'morning', right: 'buổi sáng' },
                { left: 'evening', right: 'buổi tối' },
                { left: 'lunch', right: 'bữa trưa' },
                { left: 'dinner', right: 'bữa tối' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Gọi đồ ăn':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "menu" là:',
              options: ['Thực đơn', 'Đồ uống', 'Đồ ăn', 'Nhà hàng'],
              correctAnswer: 'Thực đơn',
              explanation: '"Menu" nghĩa là thực đơn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'Can I have the ___, please?',
              blanks: [{ position: 4, answer: 'menu', acceptableAnswers: ['menu'] }],
              explanation: 'Câu hỏi xin thực đơn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ["I'd", 'like', 'to', 'order', 'pizza'],
              correctOrder: ["I'd", 'like', 'to', 'order', 'pizza'],
              explanation: 'Cấu trúc: I\'d like to order + món ăn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "bill" là:',
              options: ['Hóa đơn', 'Tiền', 'Thức ăn', 'Nước uống'],
              correctAnswer: 'Hóa đơn',
              explanation: '"Bill" nghĩa là hóa đơn thanh toán.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'coffee', right: 'cà phê' },
                { left: 'tea', right: 'trà' },
                { left: 'water', right: 'nước' },
                { left: 'juice', right: 'nước ép' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Thời tiết':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "sunny" là:',
              options: ['Nắng', 'Mưa', 'Gió', 'Lạnh'],
              correctAnswer: 'Nắng',
              explanation: '"Sunny" nghĩa là trời nắng.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'It is ___ today.',
              blanks: [{ position: 2, answer: 'raining', acceptableAnswers: ['raining', 'rainy'] }],
              explanation: 'Diễn tả thời tiết hiện tại.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['The', 'weather', 'is', 'nice', 'today'],
              correctOrder: ['The', 'weather', 'is', 'nice', 'today'],
              explanation: 'Cấu trúc: The weather is + tính từ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "cloudy" là:',
              options: ['Nhiều mây', 'Nắng', 'Mưa', 'Tuyết'],
              correctAnswer: 'Nhiều mây',
              explanation: '"Cloudy" nghĩa là trời nhiều mây.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'hot', right: 'nóng' },
                { left: 'cold', right: 'lạnh' },
                { left: 'windy', right: 'gió' },
                { left: 'snowy', right: 'tuyết' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Cảm xúc & Tính cách':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "happy" là:',
              options: ['Vui vẻ', 'Buồn', 'Giận dữ', 'Sợ hãi'],
              correctAnswer: 'Vui vẻ',
              explanation: '"Happy" nghĩa là vui vẻ, hạnh phúc.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I feel ___ when I pass the exam.',
              blanks: [{ position: 2, answer: 'happy', acceptableAnswers: ['happy', 'excited', 'glad'] }],
              explanation: 'Diễn tả cảm xúc khi đạt kết quả tốt.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['She', 'is', 'very', 'kind', 'person'],
              correctOrder: ['She', 'is', 'very', 'kind', 'person'],
              explanation: 'Cấu trúc: S + be + very + tính từ + danh từ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "angry" là:',
              options: ['Giận dữ', 'Vui vẻ', 'Buồn', 'Sợ'],
              correctAnswer: 'Giận dữ',
              explanation: '"Angry" nghĩa là giận dữ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'sad', right: 'buồn' },
                { left: 'excited', right: 'phấn khích' },
                { left: 'tired', right: 'mệt mỏi' },
                { left: 'friendly', right: 'thân thiện' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Đi lại':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "bus" là:',
              options: ['Xe buýt', 'Xe máy', 'Ô tô', 'Tàu hóa'],
              correctAnswer: 'Xe buýt',
              explanation: '"Bus" nghĩa là xe buýt.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I go to work ___ bus.',
              blanks: [{ position: 4, answer: 'by', acceptableAnswers: ['by'] }],
              explanation: 'Dùng "by" trước phương tiện.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['How', 'do', 'you', 'go', 'there'],
              correctOrder: ['How', 'do', 'you', 'go', 'there'],
              explanation: 'Câu hỏi về phương tiện đi lại.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "train" là:',
              options: ['Tàu hóa', 'Xe buýt', 'Máy bay', 'Tàu thủy'],
              correctAnswer: 'Tàu hóa',
              explanation: '"Train" nghĩa là tàu hỏa.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'car', right: 'ô tô' },
                { left: 'bike', right: 'xe đạp' },
                { left: 'plane', right: 'máy bay' },
                { left: 'ship', right: 'tàu thủy' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Nghề nghiệp':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "teacher" là:',
              options: ['Giáo viên', 'Bác sĩ', 'Kỹ sư', 'Luật sư'],
              correctAnswer: 'Giáo viên',
              explanation: '"Teacher" nghĩa là giáo viên.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'She is a ___ at the hospital.',
              blanks: [{ position: 3, answer: 'doctor', acceptableAnswers: ['doctor', 'nurse'] }],
              explanation: 'Nghề nghiệp tại bệnh viện.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['What', 'is', 'your', 'job'],
              correctOrder: ['What', 'is', 'your', 'job'],
              explanation: 'Câu hỏi về nghề nghiệp.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "engineer" là:',
              options: ['Kỹ sư', 'Giáo viên', 'Bác sĩ', 'Nông dân'],
              correctAnswer: 'Kỹ sư',
              explanation: '"Engineer" nghĩa là kỹ sư.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'doctor', right: 'bác sĩ' },
                { left: 'lawyer', right: 'luật sư' },
                { left: 'farmer', right: 'nông dân' },
                { left: 'chef', right: 'đầu bếp' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Nhà hàng':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "waiter" là:',
              options: ['Người phục vụ', 'Đầu bếp', 'Khách hàng', 'Quản lý'],
              correctAnswer: 'Người phục vụ',
              explanation: '"Waiter" nghĩa là người phục vụ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'Can I see the ___, please?',
              blanks: [{ position: 4, answer: 'menu', acceptableAnswers: ['menu'] }],
              explanation: 'Câu hỏi xin xem thực đơn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['I', 'would', 'like', 'steak'],
              correctOrder: ['I', 'would', 'like', 'steak'],
              explanation: 'Cấu trúc: I would like + món ăn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "reservation" là:',
              options: ['Đặt chỗ', 'Thanh toán', 'Thực đơn', 'Hóa đơn'],
              correctAnswer: 'Đặt chỗ',
              explanation: '"Reservation" nghĩa là đặt chỗ trước.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'appetizer', right: 'món khai vị' },
                { left: 'main course', right: 'món chính' },
                { left: 'dessert', right: 'tráng miệng' },
                { left: 'beverage', right: 'đồ uống' }
              ],
              points: 10,
              difficulty: 'medium'
            }
          ];
          break;

        case 'Du lịch':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "hotel" là:',
              options: ['Khách sạn', 'Nhà hàng', 'Sân bay', 'Bảo tàng'],
              correctAnswer: 'Khách sạn',
              explanation: '"Hotel" nghĩa là khách sạn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'Where is the nearest ___?',
              blanks: [{ position: 4, answer: 'hotel', acceptableAnswers: ['hotel', 'airport', 'station'] }],
              explanation: 'Câu hỏi tìm địa điểm.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['I', 'want', 'to', 'visit', 'Paris'],
              correctOrder: ['I', 'want', 'to', 'visit', 'Paris'],
              explanation: 'Cấu trúc: I want to visit + địa danh.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "passport" là:',
              options: ['Hộ chiếu', 'Vé máy bay', 'Vali', 'Bản đồ'],
              correctAnswer: 'Hộ chiếu',
              explanation: '"Passport" nghĩa là hộ chiếu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'ticket', right: 'vé' },
                { left: 'luggage', right: 'hành lý' },
                { left: 'airport', right: 'sân bay' },
                { left: 'museum', right: 'bảo tàng' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Công nghệ':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "computer" là:',
              options: ['Máy tính', 'Điện thoại', 'Máy ảnh', 'Tivi'],
              correctAnswer: 'Máy tính',
              explanation: '"Computer" nghĩa là máy tính.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I need to charge my ___.',
              blanks: [{ position: 5, answer: 'phone', acceptableAnswers: ['phone', 'laptop', 'tablet'] }],
              explanation: 'Các thiết bị cần sạc điện.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['The', 'internet', 'is', 'very', 'fast'],
              correctOrder: ['The', 'internet', 'is', 'very', 'fast'],
              explanation: 'Mô tả về internet.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "software" là:',
              options: ['Phần mềm', 'Phần cứng', 'Mạng', 'Dữ liệu'],
              correctAnswer: 'Phần mềm',
              explanation: '"Software" nghĩa là phần mềm.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'email', right: 'thư điện tử' },
                { left: 'website', right: 'trang web' },
                { left: 'download', right: 'tải xuống' },
                { left: 'upload', right: 'tải lên' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Giải trí':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "movie" là:',
              options: ['Phim', 'Nhạc', 'Sách', 'Trò chơi'],
              correctAnswer: 'Phim',
              explanation: '"Movie" nghĩa là phim ảnh.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I like to ___ music in my free time.',
              blanks: [{ position: 3, answer: 'listen', acceptableAnswers: ['listen', 'play'] }],
              explanation: 'Hoạt động giải trí với âm nhạc.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['Let\'s', 'watch', 'a', 'movie', 'tonight'],
              correctOrder: ['Let\'s', 'watch', 'a', 'movie', 'tonight'],
              explanation: 'Câu rủ đi xem phim.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "concert" là:',
              options: ['Buổi hòa nhạc', 'Rạp phim', 'Nhà hát', 'Công viên'],
              correctAnswer: 'Buổi hòa nhạc',
              explanation: '"Concert" nghĩa là buổi hòa nhạc.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'game', right: 'trò chơi' },
                { left: 'book', right: 'sách' },
                { left: 'music', right: 'âm nhạc' },
                { left: 'sport', right: 'thể thao' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Mua bán online':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "cart" là:',
              options: ['Giỏ hàng', 'Thanh toán', 'Giao hàng', 'Đơn hàng'],
              correctAnswer: 'Giỏ hàng',
              explanation: '"Cart" nghĩa là giỏ hàng khi mua sắm online.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'Please add this item to your ___.',
              blanks: [{ position: 6, answer: 'cart', acceptableAnswers: ['cart', 'basket'] }],
              explanation: 'Thêm sản phẩm vào giỏ hàng.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['I', 'want', 'to', 'buy', 'this'],
              correctOrder: ['I', 'want', 'to', 'buy', 'this'],
              explanation: 'Câu muốn mua hàng.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "shipping" là:',
              options: ['Vận chuyển', 'Thanh toán', 'Giảm giá', 'Hoàn trả'],
              correctAnswer: 'Vận chuyển',
              explanation: '"Shipping" nghĩa là vận chuyển hàng.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'price', right: 'giá' },
                { left: 'discount', right: 'giảm giá' },
                { left: 'payment', right: 'thanh toán' },
                { left: 'delivery', right: 'giao hàng' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Nơi ở thú cưng':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Nghĩa của từ "apartment" là:',
              options: ['Căn hộ', 'Nhà phố', 'Biệt thự', 'Phòng trọ'],
              correctAnswer: 'Căn hộ',
              explanation: '"Apartment" nghĩa là căn hộ chung cư.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I have a ___ as a pet.',
              blanks: [{ position: 3, answer: 'dog', acceptableAnswers: ['dog', 'cat', 'bird', 'fish'] }],
              explanation: 'Các loại thú cưng phổ biến.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['My', 'house', 'has', 'three', 'bedrooms'],
              correctOrder: ['My', 'house', 'has', 'three', 'bedrooms'],
              explanation: 'Mô tả về ngôi nhà.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của từ "garden" là:',
              options: ['Vườn', 'Phòng khách', 'Bếp', 'Phòng ngủ'],
              correctAnswer: 'Vườn',
              explanation: '"Garden" nghĩa là khu vườn.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'cat', right: 'mèo' },
                { left: 'dog', right: 'chó' },
                { left: 'bird', right: 'chim' },
                { left: 'fish', right: 'cá' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        case 'Các thì':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Thì nào diễn tả hành động đang xảy ra?',
              options: ['Present Continuous', 'Simple Present', 'Simple Past', 'Future Simple'],
              correctAnswer: 'Present Continuous',
              explanation: 'Present Continuous (be + V-ing) diễn tả hành động đang diễn ra.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'I ___ to school every day.',
              blanks: [{ position: 1, answer: 'go', acceptableAnswers: ['go', 'walk', 'drive'] }],
              explanation: 'Simple Present dùng cho thói quen hàng ngày.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['She', 'is', 'reading', 'a', 'book'],
              correctOrder: ['She', 'is', 'reading', 'a', 'book'],
              explanation: 'Câu Present Continuous: S + be + V-ing.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Thì Simple Past dùng để diễn tả:',
              options: ['Hành động đã xảy ra trong quá khứ', 'Hành động đang xảy ra', 'Hành động sẽ xảy ra', 'Thói quen hiện tại'],
              correctAnswer: 'Hành động đã xảy ra trong quá khứ',
              explanation: 'Simple Past dùng cho hành động đã hoàn thành trong quá khứ.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'match',
              question: 'Nối tên thì với công thức tương ứng:',
              pairs: [
                { left: 'Simple Present', right: 'S + V(s/es)' },
                { left: 'Present Continuous', right: 'S + be + V-ing' },
                { left: 'Simple Past', right: 'S + V-ed/V2' },
                { left: 'Future Simple', right: 'S + will + V' }
              ],
              points: 10,
              difficulty: 'medium'
            }
          ];
          break;

        case 'Câu điều kiện':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Câu điều kiện loại 1 dùng để:',
              options: ['Diễn tả điều có thể xảy ra ở hiện tại/tương lai', 'Diễn tả điều không có thật ở hiện tại', 'Diễn tả điều không có thật ở quá khứ', 'Diễn tả thói quen'],
              correctAnswer: 'Diễn tả điều có thể xảy ra ở hiện tại/tương lai',
              explanation: 'Câu điều kiện loại 1: If + S + V(s/es), S + will + V.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'If it rains, I ___ stay at home.',
              blanks: [{ position: 4, answer: 'will', acceptableAnswers: ['will'] }],
              explanation: 'Câu điều kiện loại 1 dùng "will" ở mệnh đề chính.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['If', 'I', 'have', 'time', 'I', 'will', 'visit', 'you'],
              correctOrder: ['If', 'I', 'have', 'time', 'I', 'will', 'visit', 'you'],
              explanation: 'Câu điều kiện loại 1: If + hiện tại đơn, S + will + V.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'translate',
              question: 'Công thức câu điều kiện loại 2 là:',
              options: ['If + S + V-ed, S + would + V', 'If + S + V(s/es), S + will + V', 'If + S + had V3, S + would have V3', 'S + V + if + S + V'],
              correctAnswer: 'If + S + V-ed, S + would + V',
              explanation: 'Câu điều kiện loại 2 dùng cho điều không có thật ở hiện tại.',
              points: 10,
              difficulty: 'hard'
            },
            {
              type: 'match',
              question: 'Nối loại câu điều kiện với công thức:',
              pairs: [
                { left: 'Type 1', right: 'If + hiện tại, will + V' },
                { left: 'Type 2', right: 'If + quá khứ, would + V' },
                { left: 'Type 3', right: 'If + had V3, would have V3' },
                { left: 'Type 0', right: 'If + hiện tại, hiện tại' }
              ],
              points: 10,
              difficulty: 'hard'
            }
          ];
          break;

        case 'Câu bị động':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Công thức câu bị động thì hiện tại đơn là:',
              options: ['S + am/is/are + V3/ed', 'S + was/were + V3/ed', 'S + have/has been + V3/ed', 'S + will be + V3/ed'],
              correctAnswer: 'S + am/is/are + V3/ed',
              explanation: 'Câu bị động hiện tại đơn: S + am/is/are + past participle.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'The book ___ written by Mark Twain.',
              blanks: [{ position: 2, answer: 'was', acceptableAnswers: ['was'] }],
              explanation: 'Câu bị động quá khứ đơn với "The book" (số ít).',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu bị động:',
              words: ['English', 'is', 'spoken', 'in', 'many', 'countries'],
              correctOrder: ['English', 'is', 'spoken', 'in', 'many', 'countries'],
              explanation: 'Câu bị động: Chủ ngữ + be + V3 + by + tân ngữ.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'translate',
              question: 'Chuyển "They built this house" sang bị động:',
              options: ['This house was built', 'This house is built', 'This house has been built', 'This house will be built'],
              correctAnswer: 'This house was built',
              explanation: 'Câu bị động quá khứ: was/were + V3.',
              points: 10,
              difficulty: 'medium'
            },
            {
              type: 'match',
              question: 'Nối thì với công thức câu bị động:',
              pairs: [
                { left: 'Present Simple', right: 'am/is/are + V3' },
                { left: 'Past Simple', right: 'was/were + V3' },
                { left: 'Present Perfect', right: 'have/has been + V3' },
                { left: 'Future Simple', right: 'will be + V3' }
              ],
              points: 10,
              difficulty: 'medium'
            }
          ];
          break;

        case 'Mẫu câu':
          topicExercises = [
            {
              type: 'multiple-choice',
              question: 'Mẫu câu "How are you?" dùng để:',
              options: ['Hỏi thăm sức khỏe', 'Hỏi tên', 'Hỏi tuổi', 'Hỏi nghề nghiệp'],
              correctAnswer: 'Hỏi thăm sức khỏe',
              explanation: '"How are you?" là câu hỏi thăm sức khỏe, tình hình.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'Nice to ___ you.',
              blanks: [{ position: 2, answer: 'meet', acceptableAnswers: ['meet', 'see'] }],
              explanation: '"Nice to meet you" là câu chào khi gặp lần đầu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['Can', 'you', 'help', 'me'],
              correctOrder: ['Can', 'you', 'help', 'me'],
              explanation: 'Câu hỏi lịch sự xin giúp đỡ.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Nghĩa của "Excuse me" là:',
              options: ['Xin lỗi/Cho phép tôi', 'Cảm ơn', 'Tạm biệt', 'Xin chào'],
              correctAnswer: 'Xin lỗi/Cho phép tôi',
              explanation: '"Excuse me" dùng để xin phép hoặc gây chú ý lịch sự.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối mẫu câu với tình huống sử dụng:',
              pairs: [
                { left: 'Thank you', right: 'Cảm ơn' },
                { left: 'I\'m sorry', right: 'Xin lỗi' },
                { left: 'Goodbye', right: 'Tạm biệt' },
                { left: 'Welcome', right: 'Chào mừng' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
          break;

        default:
          // Nếu chủ đề không có trong danh sách, tạo bài tập mặc định
          topicExercises = [
            {
              type: 'multiple-choice',
              question: `Chọn đáp án đúng về "${topicTitle}":`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 'Option A',
              explanation: 'Giải thích mẫu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'fill-blank',
              question: 'Điền từ còn thiếu vào câu:',
              sentence: 'This is a ___ sentence.',
              blanks: [{ position: 3, answer: 'sample', acceptableAnswers: ['sample'] }],
              explanation: 'Câu mẫu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'word-order',
              question: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
              words: ['This', 'is', 'a', 'test'],
              correctOrder: ['This', 'is', 'a', 'test'],
              explanation: 'Câu mẫu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'translate',
              question: 'Câu hỏi mẫu về dịch:',
              options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
              correctAnswer: 'Đáp án A',
              explanation: 'Giải thích mẫu.',
              points: 10,
              difficulty: 'easy'
            },
            {
              type: 'match',
              question: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng:',
              pairs: [
                { left: 'word1', right: 'từ 1' },
                { left: 'word2', right: 'từ 2' },
                { left: 'word3', right: 'từ 3' },
                { left: 'word4', right: 'từ 4' }
              ],
              points: 10,
              difficulty: 'easy'
            }
          ];
      }

      // Thêm topicId và order cho mỗi bài tập
      topicExercises.forEach((ex, index) => {
        exercises.push({
          topicId,
          order: order++,
          ...ex,
          words: ex.words || [],
          correctOrder: ex.correctOrder || [],
          blanks: ex.blanks || [],
          pairs: ex.pairs || [],
          options: ex.options || [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    // Insert tất cả exercises
    await Exercise.insertMany(exercises);
    console.log(`✅ Created ${exercises.length} exercises`);

    // Thống kê
    const stats = {};
    exercises.forEach(ex => {
      stats[ex.type] = (stats[ex.type] || 0) + 1;
    });
    console.log('📊 Exercise Statistics:');
    Object.entries(stats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reseedExercises();
