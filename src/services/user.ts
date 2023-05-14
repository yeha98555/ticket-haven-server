import UserModel, { IUser } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { appError } from '@/services/appError';
import { StatusCode } from '@/enums/statusCode'
const saltRounds = 10;

interface Message {
  status: number;
  statusCode: string;
  message: string;
  token?: string;
}

const userService = {
  findUserById: async (id: string) => {
    const user = await UserModel.findById(id).select([
      'username',
      'email',
      'phone',
      'gender',
      'email_verify',
      'phone_verify',
      'bank_code',
      'bank_account',
      'activity_region',
      'birthday',
    ]);
    return user;
  },
  updateUserById: async (
    id: string,
    data: Partial<
      Pick<
        IUser,
        | 'username'
        | 'phone'
        | 'gender'
        | 'bank_code'
        | 'bank_account'
        | 'activity_region'
        | 'birthday'
      >
    >,
  ) => {
    const user = await UserModel.findByIdAndUpdate(id, data, {
      runValidators: true,
      new: true,
    }).select([
      'username',
      'email',
      'phone',
      'gender',
      'email_verify',
      'phone_verify',
      'bank_code',
      'bank_account',
      'activity_region',
      'birthday',
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
            const error = appError(401, StatusCode.FORBIDDEN, '帳號/密碼錯誤！')
            resolve(error);
          }else{
            const tokenObj = {id: foundUser._id, email: foundUser.email};
            const SECRET: string = process.env.JWT_SECRET!;
            const token = jwt.sign(tokenObj, SECRET, { expiresIn: '10m' });
            const res = {status: 200, statusCode: StatusCode.SUCCESS, message: '登入成功！', token: `Bearer ${token}`};
            resolve(res);
          }
          });
        });
        return await msg;
      }else{
        const error = appError(404, StatusCode.NOT_FOUND, '帳號不存在！')
        return error;
      }
    }catch(err){
      console.log(err);
      const error = appError(500, StatusCode.SERVER_ERROR, '發生錯誤，請稍後再試')
      return error
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
            const error = appError(500, StatusCode.SERVER_ERROR, err.message)
            resolve(error);
          }else{
            const newUser = new UserModel({ username, email, password: hash});
            const message = await newUser.save().then(() => {
              UserModel.find({}).then((data)=> console.log(data));
              const res = {status: 200, statusCode: StatusCode.SUCCESS, message: '註冊成功，請重新登入'}
              return Promise.resolve(res);
              })
              .catch((err: Error)=>{
                const error = appError(500, StatusCode.SERVER_ERROR, err.message)
                return Promise.reject(error);
              });
            resolve(message);
          }
        });
      });
      return await msg;
    }else{
      return appError(401, StatusCode.FORBIDDEN, '此帳號已存在，請重新輸入！');
    }
  }
};

export default userService;
