import { Router } from 'express';
import { StoryController } from '../Controllers/Story.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';

const router = Router();

const Controller = new StoryController();

router.use(Authenticate);

router.post('/', (request, response) => {
  Controller.createNewStory(request, response);
});

router.get('/', (request, response) => {
  Controller.getStories(request, response);
});

export { router as StoryRoute };
