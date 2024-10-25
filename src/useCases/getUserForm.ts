import { User } from '../models/user.model';
import { Questions } from '../models/questions.model';
import { Request, Response } from 'express';
import { Data } from 'src/interfaces/userData';

export async function getUserData(request: Request, response: Response) {
  const data: Data = request.body;
  const phoneNumber = data.user.phoneNumber;
  const email = data.user.email;
  const user = await User.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }]});
  if (user) {
    const latestForm = await Questions.findOne({ user: user._id }).limit(1);
    response.status(200).send({ latestForm });
  }
}
