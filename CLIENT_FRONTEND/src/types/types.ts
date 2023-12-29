/**
 * The properties of a car
 */
export interface ICar {
  carId: string;
  userId: string;
  brand: string;
  model: string;
  fuel: string;
  createdAt: string;
}

/**
 * The properties of a User
 */
export interface IUser {
  userId: string;
  email: string;
  userName: string;
  roles: string[];
  createdAt: string;
}
