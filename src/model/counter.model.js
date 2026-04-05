const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // sequence name
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

counterSchema.statics.getNextSequence = async function getNextSequence(sequenceName, syncValue = 0) {
  if (sequenceName === undefined || sequenceName === null || sequenceName === '') {
    throw new Error('Counter.getNextSequence requires a valid sequenceName');
  }

  const query = { _id: String(sequenceName) };

  if (syncValue > 0) {
    const existing = await this.findOne(query);
    if (!existing) {
      await this.create({ _id: String(sequenceName), seq: syncValue });
    } else if (existing.seq < syncValue) {
      existing.seq = syncValue;
      await existing.save();
    }
  }

  const doc = await this.findOneAndUpdate(
    query,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return doc.seq;
};

// Use a dedicated collection name to avoid conflict with legacy mongoose-sequence counters/indexes.
module.exports = mongoose.model('Counter', counterSchema, 'sequence_counters');

