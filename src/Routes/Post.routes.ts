import { Router } from 'express';
import { PostController } from '../Controllers/Post.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';

const router = Router();

const Controller = new PostController();

router.use(Authenticate);

router.post('/', (request, response) => {
  Controller.createNewPost(request, response);
});

router.get('/', (request, response) => {
  Controller.getPosts(request, response);
});

router.get('/:post_id', (request, response) => {
  Controller.getPostById(request, response);
});

router.delete('/:post_id', (request, response) => {
  Controller.deletePost(request, response);
});

router.get('/post-like/:post_id', (request, response) => {
  Controller.like(request, response);
});

router.get('/post-unLike/:post_id', (request, response) => {
  Controller.unLike(request, response);
});

router.post('/post-comment/:post_id', (request, response) => {
  Controller.comment(request, response);
});

router.post('/post-reply-comment/:post_id/:commentIdx', (request, response) => {
  Controller.replyComment(request, response);
});

export { router as PostRoute };
