import { Schema, model } from 'mongoose';

export const Questions = model(
  'Questions',
  new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    questions: {
      type: Schema.Types.Mixed,
    },
  })
);
