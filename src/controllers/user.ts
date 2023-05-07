import { Request, Response } from 'express';
import {signupService, signinService} from '../services/user'

export const signup = async (req: Request, res: Response) => {
  try {
    const data = await signupService(req.body);
    res.status(200);
    res.send(data);
  } catch (error) {
    res.status(500);
    res.send({ message: '好像哪裡出錯了!' });
  }
}

export const signin = async (req: Request, res: Response) => {
  try {
    const data = await signinService(req.body);
    res.status(200);
    res.send(data);
  } catch (error) {
    res.status(500);
    res.send({ message: '好像哪裡出錯了!' });
  }
}
