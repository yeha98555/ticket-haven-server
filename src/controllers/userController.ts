import { Request, Response } from 'express';

export const signup = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;
    console.log(userName, email, password);
    res.status(200);
    res.send({message: '註冊成功!'});
  } catch (error) {
    res.status(500);
    res.send({ message: '好像哪裡出錯了!' });
  }
}

export const signin = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    res.status(200);
    res.send({message:'登入成功!'});
  } catch (error) {
    res.status(500);
    res.send({ message: '好像哪裡出錯了!' });
  }
}
