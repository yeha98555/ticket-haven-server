import User from '@/models/user';

const userService = {
  signin: async ({email, password}: {email: string, password: string}) => {
    console.log(email, password);
    return {message: '登入成功！'}
  },
  signup: async (req: {userName: string, email: string, password: string}) => {
    const newUser = new User(req);
    const message = await newUser.save().then(() => {
      return Promise.resolve({status: 200, message: '註冊成功，請重新登入'});
    })
    .catch((error: Error)=>{
      return Promise.reject({status: 500, message: error.message});
    });
    return message
  }
}

export default userService;
