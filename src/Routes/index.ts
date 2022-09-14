import { Application } from 'express';
import { AuthRoute } from './Auth.routes';
import { PostRoute } from './Post.routes';
import { StoryRoute } from './Story.routes';
import { savedPostRoute } from '../Routes/savedPost.routes';

const mountRoutes = (app: Application) => {
  app.use('/api/v1/auth', AuthRoute);
  app.use('/api/v1/post', PostRoute);
  app.use('/api/v1/story', StoryRoute);
  app.use('/api/v1/savedPosts', savedPostRoute);
};

export { mountRoutes };
