import { Request, Response } from 'express';
import { pool } from '../Config/Database.config';
import { File, IncomingForm } from 'formidable';
import { fileUpload } from '../Utils/FileUpload.util';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

config();

interface Post {
  createNewPost(request: Request, response: Response): void;

  getPosts(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>>>;

  getPostById(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>>>;

  deletePost(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  like(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  unLike(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  comment(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;

  replyComment(
    request: Request,
    response: Response
  ): Promise<Response<any, Record<string, any>> | undefined>;
}

export class PostController implements Post {
  createNewPost(request: any, response: Response) {
    const form = new IncomingForm();
    const token = request.token;
    const username = token.username;

    form.parse(request, async (error, fields, files) => {
      if (error) {
        return response
          .status(500)
          .json({ message: 'Network Error: Failed to upload post' });
      }

      const { caption } = fields;

      const media_count = Object.keys(files).length;
      const media_keys = Object.keys(files);

      const media_urls = [];

      for (let i = 0; i < media_count; i++) {
        const file = (files[media_keys[i]] as File).filepath;
        const file_url = await fileUpload(file);
        media_urls.push(file_url);
      }

      const query =
        'INSERT INTO posts (media , caption , author) VALUES($1, $2, $3)';

      pool
        .query(query, [media_urls, caption, username])
        .then(() => {
          return response
            .status(201)
            .json({ message: 'Post created successfully' });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }

  async getPosts(_request: Request, response: Response) {
    const query = `SELECT posts.id,posts.media,posts.caption,posts.likes,posts.comments,
      users.username FROM posts 
      INNER JOIN users ON posts.author = users.username`;

    const data = (await pool.query(query)).rows;
    return response.status(200).json(data);
  }

  async getPostById(request: Request, response: Response) {
    const { post_id } = request.params;
    let query = `SELECT * FROM posts WHERE posts.id =$1`;
    const data = (await pool.query(query, [post_id])).rows[0];
    return response.status(200).json({ data });
  }

  async deletePost(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    console.log(username);

    const { post_id } = request.params;

    let query = 'SELECT * FROM posts WHERE posts.id = $1';
    let data = (await pool.query(query, [post_id])).rows[0];
    console.log(data);

    if (data) {
      query = 'DELETE FROM posts WHERE posts.id = $1';

      pool
        .query(query, [post_id])
        .then(() => {
          return response.status(200).json({
            message: 'Post Removed Successfully',
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    } else {
      return response.status(400).json({ message: 'Post not found' });
    }
  }

  async like(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const { post_id } = request.params;

    let query = `SELECT * FROM posts WHERE posts.id =$1`;
    const data = (await pool.query(query, [post_id])).rows[0];

    if (data && !data.likes) {
      const likes = [username];
      query = `UPDATE posts SET likes = $1 WHERE posts.id = $2`;
      pool
        .query(query, [likes, post_id])
        .then(() => {
          return response
            .status(200)
            .json({ message: `Liked post succesfully` });
        })
        .catch((error) => {
          return response.status(500).json(error);
        });
    } else if (data && !data.likes.includes(username)) {
      const likes = [...data.likes, username];
      query = `UPDATE posts SET likes = $1 WHERE posts.id = $2`;
      pool
        .query(query, [likes, post_id])
        .then(() => {
          return response
            .status(200)
            .json({ message: `Liked post succesfully` });
        })
        .catch((error) => {
          return response.status(500).json(error);
        });
    } else {
      return response.status(400).json({ message: 'Post not found' });
    }
  }

  async unLike(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const { post_id } = request.params;

    let query = `SELECT * FROM posts WHERE posts.id =$1`;
    const data = (await pool.query(query, [post_id])).rows[0];

    if (data && data.likes.includes(username)) {
      data.likes = data.likes.filter((users: any) => users !== username);
      query = `UPDATE posts SET likes = $1 WHERE posts.id = $2`;
      pool
        .query(query, [data.likes, post_id])
        .then(() => {
          return response
            .status(200)
            .json({ message: `Removed Liked Succesfully` });
        })
        .catch((error) => {
          return response.status(500).json(error);
        });
    } else {
      return response.status(400).json({ message: 'Post not found' });
    }
  }

  async comment(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const { comment } = request.body;
    const { post_id } = request.params;

    let query = `SELECT * FROM posts WHERE posts.id =$1`;
    const data = (await pool.query(query, [post_id])).rows[0];

    if (data) {
      if (!data.comments) {
        const newComment = [
          {
            id: randomUUID(),
            username,
            comment,
            replies: [],
          },
        ];

        query = `UPDATE posts SET comments=$1 WHERE posts.id = $2`;
        pool
          .query(query, [JSON.stringify(newComment), post_id])
          .then(() => {
            return response
              .status(200)
              .json({ message: `Comment on post succesfully` });
          })
          .catch((error) => {
            return response.status(500).json(error);
          });
      } else {
        const newComment = {
          id: randomUUID(),
          username,
          comment,
          replies: [],
        };

        const updatedComments = JSON.stringify([...data.comments, newComment]);
        query = `UPDATE posts SET comments=$1 WHERE posts.id = $2`;
        pool
          .query(query, [updatedComments, post_id])
          .then(() => {
            return response
              .status(200)
              .json({ message: `Comment on post succesfully` });
          })
          .catch((error) => {
            return response.status(500).json(error);
          });
      }
    } else {
      return response.status(400).json({ message: 'Post not found' });
    }
  }

  async replyComment(request: any, response: Response) {
    const token = request.token;
    const username = token.username;
    const { post_id, commentIdx } = request.params;
    const { reply } = request.body;

    let query = 'SELECT * FROM posts WHERE posts.id = $1';
    let post = await (await pool.query(query, [post_id])).rows[0];

    if (post) {
      let comments = [...post.comments];
      let comment = comments.filter((comment) => comment.id === commentIdx);
      comment[0].replies.push({ id: randomUUID(), reply, username });

      query = 'UPDATE posts SET comments = $1 WHERE posts.id = $2';
      pool
        .query(query, [JSON.stringify(comments), post_id])
        .then(() => {
          return response.status(200).json({ messsge: 'Replied to comment' });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    } else {
      return response.status(400).json({ message: 'Post not found' });
    }
  }
}
