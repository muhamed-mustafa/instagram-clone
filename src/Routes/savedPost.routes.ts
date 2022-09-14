import { Router } from 'express';
import { savedPostController } from '../Controllers/savedPost.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';

const router = Router();

const Controller = new savedPostController();

router.use(Authenticate);

router.post('/', (request, response) => {
  Controller.create(request, response);
});

router.get('/', (request, response) => {
  Controller.getSavedPosts(request, response);
});

router.delete('/', (request, response) => {
  Controller.remove(request, response);
});

export { router as savedPostRoute };
