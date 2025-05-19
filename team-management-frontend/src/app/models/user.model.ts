export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  joinDate?: Date;
  lastActive?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
