export type User = {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  status: string;
  exp?: number;
  token?: string;
};

export type UserTokenData = {
  id: number;
  email: string;
  role: string;
  status: string;
  exp: number;
};
