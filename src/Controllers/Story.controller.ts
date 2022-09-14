import { Response } from 'express';
import CornJob from 'cron';
import { pool } from '../Config/Database.config';
import { IncomingForm } from 'formidable';
import { fileUpload } from '../Utils/FileUpload.util';

const Cron = CornJob.CronJob;

export const job = new Cron('* * * * * *', async () => {
  let query = 'SELECT * FROM story';
  let data = await pool.query(query);

  data.rows.forEach((row) => {
    const currentDate: any = new Date();
    const hours = Math.abs(currentDate - row.timestap) / 36e5;

    if (hours >= 24) {
      query = `DELETE FROM story WHERE story.id = $1`;

      pool
        .query(query, [row.id])
        .then(() => {
          console.log('Story Deleted');
        })
        .catch((err) => {
          console.log(`Failed to delete story ${err.message}`);
        });
    }
  });
});

export class StoryController {
  createNewStory(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();
    form.parse(request, async (error, fields, files: any) => {
      if (error) {
        return response.status(500).json({ error: error.message });
      }

      const { text } = fields;
      const { backgroundMedia } = files;

      const media_url = await fileUpload(backgroundMedia.filepath);

      const query =
        'INSERT INTO story (owner , media , text , timestap) VALUES ($1, $2, $3, $4)';

      pool
        .query(query, [username, media_url, text, new Date()])
        .then(() => {
          return response
            .status(201)
            .json({ message: 'Story created successfully' });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }

  getStories(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();

    form.parse(request, async (error) => {
      if (error) {
        return response.status(500).json({ error: error.message });
      }

      const query = 'SELECT * FROM story WHERE owner = $1';

      pool
        .query(query, [username])
        .then((data) => {
          return response.status(200).json({
            message: 'Get All Stories Successfully',
            stories: data.rows,
          });
        })
        .catch((err) => {
          return response.status(500).json({ error: err.message });
        });
    });
  }
}
