import UserModel, { IUser } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import localStrategy from 'passport-local';
import { resolve } from 'path';
const saltRounds = 10;

interface Message {
  status: number;
  message: string;
  token?: string;
}

const userService = {
  findUserById: async (id: string) => {
    const user = await UserModel.findById(id)
      .select([
        'username',
        'email',
        'phone',
        'gender',
        'email_verify',
        'phone_verify',
        'bank_code',
        'bank_account',
        'activity_region',
      ])
      .lean({ virtuals: true });
    return user;
  },
  updateUserById: async (
    id: string,
    data: Pick<
      IUser,
      | 'username'
      | 'phone'
      | 'gender'
      | 'bank_code'
      | 'bank_account'
      | 'activity_region'
    >,
  ) => {
    const user = await UserModel.findByIdAndUpdate(id, data, {
      runValidators: true,
      new: true
    }).select([
      '-_id',
      'username',
      'phone',
      'gender',
      'bank_code',
      'bank_account',
      'activity_region',
    ]);
    return user;
  },
  signin: async ({email, password}: {email: string, password: string}) => {
    try{
      const foundUser = await UserModel.findOne({email})
      if(foundUser){
        const msg = new Promise<Message>((resolve) => {
          bcrypt.compare(password, foundUser.password, (err, result)=>{
          if(err || !result){
            return resolve({status: 404, message: '帳號/密碼錯誤！'});
          }
          const tokenObj = {_id: foundUser._id, email: foundUser.email};
          const SECRET: string = process.env.JWT_SECRET ?? 'jwttokensecret'
          const token = jwt.sign(tokenObj, SECRET)
          return resolve({status: 200, message: '登入成功！', token: `JWT ${token}`});
          });
        });
        return await msg;
      }else{
        return {status: 404, message: '帳號不存在！'};
      }
    }catch(error){
      console.log(error);
      return {status: 500, message: '發生錯誤，請稍後再試'}
    }
  },
  signup: async (req: {username: string, email: string, password: string}) => {
    const {username, email, password} = req;
    const isExistUser = await UserModel.findOneAndDelete({email})
      .then((data)=>{
        if(data) return Promise.resolve(true)
        else return Promise.resolve(false);
      }).catch(e => Promise.reject(false));
    if(!isExistUser){
      const msg = new Promise<Message>((resolve) => {
        bcrypt.hash(password, saltRounds, async (err, hash)=>{
          if(err) {
            resolve({status: 500, message: err.message});
          }else{
            const newUser = new UserModel({ username, email, password: hash});
            const message = await newUser.save().then(() => {
              UserModel.find({}).then((data)=> console.log(data));
              return Promise.resolve({status: 200, message: '註冊成功，請重新登入'});
              })
              .catch((error: Error)=>{
                return Promise.reject({status: 500, message: error.message});
              });
            resolve(message);
          }
        });
      });
      return await msg;
    }else{
      return {status: 400, message: '此帳號已存在，請重新輸入！'}
    }
  }
};

export default userService;
