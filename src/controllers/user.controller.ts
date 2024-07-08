import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import userServices from '../services/user.services'
import User, { IUser } from '../models/user.model'
require('dotenv').config()
import bcrypt from 'bcrypt'

const accessKey = process.env.JWT_ACCESS_KEY as string

class UserController {
  // Add new user
  public async addUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await userServices.addUser(req.body)
      res.status(200).json({ message: 'Create new user successfully', newUser })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  // Get All user
  public async getAllUser(req: Request, res: Response): Promise<void> {
    try {
      const users = await userServices.getAllUsers()
      res.status(200).json({ message: 'List of Users', users })
    } catch (error) {
      res.status(500).json(error)
    }
  }

  // edit user
  public async editUser(req: Request, res: Response): Promise<void> {
    try {
      const updatedUser = await userServices.editUser(req.params.id, req.body)
      res.status(200).json({ message: 'Update successfully', updatedUser })
    } catch (error) {
      res.status(500).json(error)
    }
  }

  // delete user
  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deleteUser = await userServices.deleteUser(req.params.id)
      if (deleteUser) {
        res.status(200).json({ message: 'Delete successfully', deleteUser })
      } else {
        res.status(404).json('Delete user fail')
      }
    } catch (error) {
      res.status(500).json(error)
    }
  }

  // Login
  public getLoginPage(req: Request, res: Response) {
    res.render('login.ejs')
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email })
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
          const accessToken = jwt.sign({ id: user._id, name: user.name }, accessKey, {
            expiresIn: '120s'
          })
          res.cookie('token', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 60 * 1000
          })
          ///res.redirect('/event');

          res.status(201).json({ message: 'Login successfully' })
        } else {
          res.status(400).json({ message: 'Password wrong' })
        }
      } else {
        res.status(400).json({ message: 'Email wrong' })
      }
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  // Register Page
  public getRegisterPage(req: Request, res: Response) {
    res.render('register.ejs')
  }

  public async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body

    try {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        age: 14
      })
      await newUser.save()
      res.status(201).json({ message: 'User registered successfully', newUser })
    } catch (error) {
      res.status(500).json({ message: 'Server error' })
    }
  }
}

export default new UserController()
