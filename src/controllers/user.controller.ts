import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { userValidation } from '../middleware/user.validator.middleware';
import userQueue from '../queue/user.queue';
import redisClient from '../config/Redis.database';
import jwt from 'jsonwebtoken';
require('dotenv').config();
import bcrypt from 'bcrypt';


const accessKey = process.env.JWT_ACCESS_KEY as string;

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
  public getLoginPage(req: Request, res: Response) {
    res.render('login.ejs');
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const accessToken = jwt.sign({ id: user._id, name: user.name }, accessKey, {
            expiresIn: '120s',
          });
          res.cookie('token', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 60 * 1000,
          });
          res.redirect('/event');
        } else {
          res.send('Password wrong');
        }
      } else {
        res.send('Your email is wrong ');
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // Register
  public getRegisterPage(req: Request, res: Response) {
    res.render('register.ejs');
  }

  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.send('User already exist');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        age: 14,
      });

      await newUser.save();
      res.redirect('login');
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  public async getIndexPage(req: Request, res: Response): Promise<void>{
    const user = res.locals.user.name;

    if (user) {
      res.render('index', {user})
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}

export default new UserController();
