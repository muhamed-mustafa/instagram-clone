import { Router } from 'express';
import { AuthController } from '../Controllers/Auth.controller';
import { Authenticate } from '../Middleware/Authenticate.middleware';

const router = Router();
const Controller = new AuthController();

router.post('/singup', (request, response) => {
  Controller.signup(request, response);
});

router.post('/signin', (request, response) => {
  Controller.signin(request, response);
});

router.post('/signout', (request, response) => {
  Controller.signout(request, response);
});

router.patch('/update-user', Authenticate, (request, response) => {
  Controller.updateUser(request, response);
});

router.delete('/delete-user', Authenticate, (request, response) => {
  Controller.deleteUser(request, response);
});

router.patch('/follow', Authenticate, (request, response) => {
  Controller.follow(request, response);
});

router.patch('/unFollow', Authenticate, (request, response) => {
  Controller.unFollow(request, response);
});

export { router as AuthRoute };
