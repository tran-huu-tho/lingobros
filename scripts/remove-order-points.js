const mongoose = require('mongoose');

async function removeFields() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lingobros');
    console.log('Connected to MongoDB');

    const Exercise = mongoose.model('Exercise', new mongoose.Schema({}, { strict: false }));
    
    const result = await Exercise.updateMany(
      {},
      { $unset: { order: '', points: '' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} exercises`);
    console.log('Removed fields: order, points');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeFields();
