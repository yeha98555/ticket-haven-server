export const signinService = async ({email, password}: {email: string, password: string}) => {
  console.log(email, password);
  return {message: '登入成功！'}
}

export const signupService = async ({userName, email, password}: {userName: string, email: string, password: string}) => {
  console.log(userName, email, password);
  return {message: '註冊成功，請重新登入'}
}
