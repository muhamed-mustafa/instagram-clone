import e, { Response } from 'express';
import { pool } from '../Config/Database.config';
import { IncomingForm } from 'formidable';

export class savedPostController {
  async create(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();
    form.parse(request, async (error) => {
      if (error) {
        return response.status(500).json({ error: error.message });
      }

      const { id } = request.query;
      if (!id) {
        return response.status(400).json({ message: 'id query is required' });
      }

      let query = 'SELECT * FROM savedpost WHERE owner = $1';
      let data = await pool.query(query, [username]);

      if (data.rowCount > 0) {
        data.rows.forEach((row) => {
          if (row.post === id) {
            return response
              .status(400)
              .json({ message: 'Post is already exists in savedPosts' });
          }
        });
      } else {
        query = 'INSERT INTO savedpost (owner , post) VALUES ($1, $2)';
        pool
          .query(query, [username, id])
          .then(() => {
            return response
              .status(201)
              .json({ message: 'Post Added Successfully' });
          })
          .catch((err) => {
            return response.status(500).json({ error: err.message });
          });
      }
    });
  }

  getSavedPosts(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();

    form.parse(request, async (error) => {
      if (error) {
        return response.status(500).json({ error: error.message });
      }

      const query = 'SELECT * FROM savedpost WHERE owner = $1';

      pool
        .query(query, [username])
        .then((data) => {
          return response.status(200).json({
            message: 'Get All Saved Posts Successfully',
            savedPosts: data.rows,
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }

  remove(request: any, response: Response) {
    const form = new IncomingForm();

    form.parse(request, async (error) => {
      if (error) {
        return response.status(500).json({ error: error.message });
      }

      const { id } = request.query;
      if (!id) {
        return response.status(400).json({ message: 'id query is required' });
      }

      const query = 'DELETE FROM savedpost WHERE savedpost.id = $1';

      pool
        .query(query, [id])
        .then(() => {
          return response.status(200).json({
            message: 'Removed Successfully',
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }
}
