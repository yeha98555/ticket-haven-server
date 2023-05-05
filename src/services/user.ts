import UserModel from '@/models/user';

const userService = {
  findUserById: async (id: string) => {
    const user = await UserModel.findById(id).lean({ virtuals: true });
    return user;
  },
};

export default userService;
