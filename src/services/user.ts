import UserModel, { IUser } from '@/models/user';

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
    console.log(email, password);
    const message = await UserModel.findOne({email})
      .then((data)=> {
        if(data){
          if(data.password === password){
            return Promise.resolve({status: 200, message: '登入成功！'});
          }else{
            return Promise.resolve({status: 200, message: '帳號/密碼錯誤！'});
          }
        }else{
          return Promise.resolve({status: 200, message: '帳號/密碼錯誤！'});
        }
      })
      .catch(error => Promise.reject({status: 500, message: error.message}))
      return message;
  },
  signup: async (req: {username: string, email: string, password: string}) => {
    const isExistUser = await UserModel.findOne({email: req.email})
      .then((data)=>{
        console.log(data);
        if(data) return Promise.resolve(true)
        else return Promise.resolve(false)
      }).catch(e => Promise.reject(false));
    if(!isExistUser){
      const newUser = new UserModel(req);
      const message = await newUser.save().then(() => {
        UserModel.find({}).then((data)=> console.log(data));
        return Promise.resolve({status: 200, message: '註冊成功，請重新登入'});
      })
      .catch((error: Error)=>{
        return Promise.reject({status: 500, message: error.message});
      });
      return message
    }else{
      return {status: 400, message: '此帳號已存在，請重新輸入！'}
    }
  }
};

export default userService;
