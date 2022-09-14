import { Request, Response } from 'express';
import { pool } from '../Config/Database.config';
import { hash, genSalt, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { IncomingForm } from 'formidable';
import { fileUpload } from '../Utils/FileUpload.util';
import { updateHelper } from '../Utils/update-helper';
import { config } from 'dotenv';
config();

interface Auth {
  signup(request: Request, response: Response): void;

  signin(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>>>;

  signout(
    request: Request,
    response: Response
  ): Response<any, Record<string, any>>;

  updateUser(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  deleteUser(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  follow(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  unFollow(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;
}

export class AuthController implements Auth {
  signup(request: Request, response: Response) {
    const form = new IncomingForm();

    form.parse(request, async (error, fields: any, files: any) => {
      const { email, password, username, fullname, bio } = fields;
      const { profile } = files;

      if (!email || !password || !username || !fullname || !bio || !profile) {
        return response
          .status(400)
          .json({ message: 'All fields must be provided.' });
      }

      const profile_url = await fileUpload(profile.filepath);

      const query =
        'INSERT INTO users (username, email, password, fullname, bio , profile) VALUES ($1 , $2, $3, $4, $5, $6)';

      const salt = await genSalt(12);
      const hashedPassword = await hash(password, salt);
      const values = [
        username,
        email,
        hashedPassword,
        fullname,
        bio,
        profile_url,
      ];

      await pool
        .query(query, values)
        .then(() => {
          return response
            .status(201)
            .json({ message: 'Account created succesfully' });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }

  async signin(request: Request, response: Response) {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ message: 'All fields must be provided.' });
    }

    const query = 'SELECT * FROM users WHERE email = $1';
    const user = (await pool.query(query, [email])).rows[0];

    if (!user) {
      return response
        .status(404)
        .json({ message: 'Accout with this email does not exist' });
    }

    const hashedPassword = user.password;
    const isPasswordValid = await compare(password, hashedPassword);

    if (!isPasswordValid) {
      return response.status(400).json({ msg: 'Invalid password' });
    }

    const token_payload = {
      username: user.username,
      email: user.email,
    };

    const token = sign(token_payload, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    response.cookie('token', token, { httpOnly: true, maxAge: 1000 });

    return response.status(200).json({ status: 'OK', token });
  }

  signout(_request: Request, response: Response) {
    response.cookie('token', '', { maxAge: 1 });

    return response
      .status(200)
      .json({ status: 'OK', message: 'Successfully signed out' });
  }

  async updateUser(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    let query = 'SELECT * FROM users WHERE users.username = $1';
    let data = (await pool.query(query, [username])).rows[0];

    if (data) {
      let updateUserQuery = updateHelper(
        username,
        request.body,
        'users',
        'users.username'
      );

      let data = Object.keys(request.body).map(function (key) {
        return request.body[key];
      });

      pool
        .query(updateUserQuery, data)
        .then(() => {
          return response
            .status(200)
            .json({ message: 'You Updated Your data successfully' });
        })
        .catch((error) => {
          return response.status(500).json({ error: error.message });
        });
    } else {
      return response.status(400).json({ message: 'User not found' });
    }
  }

  async deleteUser(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    let query = 'SELECT * FROM users WHERE users.username = $1';
    let data = (await pool.query(query, [username])).rows[0];

    if (data) {
      query = 'DELETE FROM users WHERE users.username = $1';

      pool
        .query(query, [username])
        .then(() => {
          return response.status(200).json({
            message: 'User Removed Successfully',
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    } else {
      return response.status(400).json({ message: 'User not found' });
    }
  }

  async follow(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const { friendName } = request.query;
    let queryOne = 'SELECT * FROM users WHERE users.username = $1';
    let dataOfFriend = (await pool.query(queryOne, [friendName])).rows[0];

    if (!dataOfFriend.followers) {
      let followers = [username];

      queryOne = `UPDATE users SET followers = $1 WHERE users.username = $2`;
      pool
        .query(queryOne, [followers, friendName])
        .then(() => {
          return response
            .status(200)
            .json({ message: `You Followed ${friendName} succesfully` });
        })
        .catch((error) => {
          return response.status(500).json(error);
        });
    } else if (dataOfFriend.followers.includes(username)) {
      return response
        .status(400)
        .json({ message: `You Already Follow ${friendName}` });
    } else {
      let followers = [...dataOfFriend.followers, username];
      queryOne = `UPDATE users SET followers = $1 WHERE users.username = $2`;
      pool
        .query(queryOne, [followers, friendName])
        .then(() => {
          return response
            .status(200)
            .json({ message: `You Followed ${friendName} succesfully` });
        })
        .catch((error) => {
          return response.status(500).json(error);
        });
    }

    let queryTwo = 'SELECT * FROM users WHERE users.username = $1';
    let dataOfCurrentUser = (await pool.query(queryTwo, [username])).rows[0];

    if (!dataOfCurrentUser.following) {
      let following = [friendName];
      queryTwo = `UPDATE users SET following = $1 WHERE users.username = $2`;
      pool
        .query(queryTwo, [following, username])
        .then(() => {
          return response.status(200).json({
            message: `${friendName} Added to your following succesfully`,
          });
        })
        .catch((error) => {
          return response.status(500).json();
        });
    } else if (dataOfCurrentUser.following.includes(friendName)) {
      return response
        .status(400)
        .json({ message: `${friendName} is already in the your following` });
    } else {
      let following = [...dataOfCurrentUser.following, friendName];
      queryTwo = `UPDATE users SET following = $1 WHERE users.username = $2`;
      pool
        .query(queryTwo, [following, username])
        .then(() => {
          return response.status(200).json({
            message: `${friendName} Added to your following succesfully`,
          });
        })
        .catch((error) => {
          return response.status(500).json();
        });
    }
  }

  async unFollow(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const { friendName } = request.query;
    let queryOne = 'SELECT * FROM users WHERE users.username = $1';
    let dataOfFriend = (await pool.query(queryOne, [friendName])).rows[0];

    if (dataOfFriend.followers.includes(username)) {
      dataOfFriend.followers = dataOfFriend.followers.filter(
        (users: any) => users !== username
      );

      queryOne = `UPDATE users SET followers = $1 WHERE users.username = $2`;
      pool
        .query(queryOne, [dataOfFriend.followers, friendName])
        .then(() => {
          return response.status(200).json({
            message: `You Removed Follow Successfully`,
          });
        })
        .catch((error) => {
          return response.status(500).json();
        });
    } else {
      return response
        .status(400)
        .json({ message: `You don't Follow ${friendName} to remove follow` });
    }

    let queryTwo = 'SELECT * FROM users WHERE users.username = $1';
    let dataOfCurrentUser = (await pool.query(queryTwo, [username])).rows[0];

    if (dataOfCurrentUser.following.includes(friendName)) {
      dataOfCurrentUser.following = dataOfCurrentUser.following.filter(
        (users: any) => users !== friendName
      );

      queryTwo = `UPDATE users SET following = $1 WHERE users.username = $2`;
      pool
        .query(queryTwo, [dataOfCurrentUser.following, username])
        .then(() => {
          return response.status(200).json({
            message: `Follow Removed Successfully From Your Following`,
          });
        })
        .catch((error) => {
          return response.status(500).json();
        });
    }
  }
}
