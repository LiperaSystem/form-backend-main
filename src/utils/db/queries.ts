import { User } from '../../models/user.model';
import { Questions } from '../../models/questions.model';
import { Data } from '../../interfaces/userData';

export async function getLastForm(phoneNumber: string) {
  const user = await User.findOne({ phoneNumber });
  if (user) {
    const latestForm = await Questions.findOne({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(1);
    return latestForm;
  } else {
    return null;
  }
}

export async function saveUserForm(data: Data) {
  const questions = data.questions;
  const existingUser = await User.findOne({
    $or: [
      { email: data.user.email },
      { phoneNumber: data.user.phoneNumber },
    ],
  });

  if (existingUser) {
    await Questions.create({
      user: existingUser._id,
      questions,
    });
  } else {
    const newUser = new User(data.user);
    await newUser.save().then(() => {
      const question = new Questions({
        user: newUser._id,
        questions,
      });
      return question.save();
    });
  }
}
