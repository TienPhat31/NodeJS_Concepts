import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { userValidation } from '../middleware/user.validator.middleware';
import userQueue from '../queue/user.queue';
import redisClient from '../config/Redis.database';
import jwt from 'jsonwebtoken';
import { emit } from 'process';
require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY as string;

class UserController {
  // Add new user
  public async addUser(req: Request, res: Response): Promise<void> {
    try {
      // Validate data
      const { error, value } = userValidation.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0].message.replace(/"/g, '') });
        return;
      }

      // Add new user to DB
      const user = new User(value);
      await user.save();

      // Add to Redis
      await userQueue.add('saveToRedis', user);

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  // Get All user
  public async getAllUser(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // edit user
  public async editUser(req: Request, res: Response): Promise<void> {
    try {
      // Validate data
      const { error, value } = userValidation.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0].message.replace(/"/g, '') });
        return;
      } else {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, value, {
          new: true,
        });

        res.status(200).json(value);

        if (updatedUser) {
          // Update Redis data after editing user
          const userData = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            age: updatedUser.age.toString(),
            // Add other necessary fields
          };

          const newUser = new User(userData);

          await redisClient.sRem('users', String(userData._id));
          //await userQueue.add('saveToRedis', newUser);
        } else {
          res.status(500).json('User not found');
        }
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // delete user
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deleteUser = await User.findByIdAndDelete(req.params.id);
      if (deleteUser) {
        res.status(200).json(deleteUser);
      } else {
        res.status(500).json('Delete user fail');
      }
    } catch (error) {}
  }

  // Login
  public async loginUser(req: Request, res: Response): Promise<void> {
    const { userName, password } = req.body;

    if (userName == 'user' && password == '1234') {
      const user = {
        name: userName,
      };
      const accessToken = jwt.sign(user, secretKey, { expiresIn: '1 minute' });
      res.status(200).json(accessToken);
    } else {
      res.status(500).json('Username & password incorrect');
    }
  }

  public index(req: Request, res: Response) {
    res.send('Index page');
  }
}

export default new UserController();
