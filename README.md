# Instgram Clone

## Technology Used :

     PostgreSQL Database, Express, Node.js, TypeScript.

<br>

## INSTRUCTIONS :

- <h2> To run this API :</h2>

  1. First clone the repository

  2. Install the node modules by the following command : `npm install`

  3. Change the values in the .env file to your preference.

  4. To run in development mode, type the following: `npm run start`

# FEATURES

<h1>Backend API</h1>

<h1> Authentication </h1>

- POST /api/v1/auth/singup

  `Create new user`

- POST /api/v1/auth/signin

  `User sign in with email and password`

- POST /api/v1/auth/signout

  `User sign out`

- PATCH /api/v1/auth/update-user

  `Update current user`

- DELETE /api/v1/auth/delete-user

  `Delete current user`

- PATCH /api/v1/auth/follow

  `Follow user`

- PATCH /api/v1/auth/unFollow

  `unFollow user`

<h1> Post </h1>

- POST /api/v1/post

  `Create new post`

- GET /api/v1/post

  `Get All posts`

- GET /api/v1/post/:post_id

  `Get specific post by post_id`

- GET /api/v1/post/post-like/:post_id

  `Like Post`

- GET /api/v1/post/post-unLike/:post_id

  `unLike Post`

- POST /api/v1/post/post-comment/:post_id

  `Comment on post`

- POST /api/v1/post/post-reply-comment/:post_id/:commentIdx

  `Reply on specific comment`

<h1> savedPost </h1>

- POST /api/v1/savedPosts

  `Add post to savedPosts`

- GET /api/v1/savedPosts

  `Get All savedPosts`

- DELETE /api/v1/savedPosts

  `Remove post from savedPosts`

<h1> Story </h1>

- POST /api/v1/story

  `Add new story and will be deleted after 24 hours`

- GET /api/v1/story

  `Get All stories for current user`
