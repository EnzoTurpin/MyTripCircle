// Minimal User model stub for TypeScript type-checking.
// The real backend user storage is implemented in the JS server using MongoDB.
// This file exists mainly so that imports like "../models/User.ts" compile.

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}

// This is a very lightweight stub with the methods used in controllers/middlewares.
// If these controllers are ever wired to a real Node backend, replace this with
// a proper implementation (e.g. using MongoDB driver or Mongoose).
export default class User {
  // Instance properties (shape of a user document)
  _id!: string;
  name!: string;
  email!: string;
  password!: string;
  createdAt?: Date;

  // Save changes on the current instance
  async save(): Promise<void> {
    throw new Error("User.save() is not implemented in this stub model.");
  }

  // Static methods used in the existing code
  static async findByIdAndUpdate(
    _id: string,
    _update: Partial<IUser>,
    _options?: { new?: boolean },
  ): Promise<IUser> {
    throw new Error(
      "User.findByIdAndUpdate() is not implemented in this stub model.",
    );
  }

  static async findById(_id: string): Promise<IUser | null> {
    throw new Error("User.findById() is not implemented in this stub model.");
  }
}
