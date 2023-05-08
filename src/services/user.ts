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
    }).select([
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
    return {message: '登入成功！'}
  },
  signup: async (req: {userName: string, email: string, password: string}) => {
    const newUser = new UserModel(req);
    const message = await newUser.save().then(() => {
      return Promise.resolve({status: 200, message: '註冊成功，請重新登入'});
    })
    .catch((error: Error)=>{
      return Promise.reject({status: 500, message: error.message});
    });
    return message
  }
};

export default userService;
