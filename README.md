This repository is a demo of a blog describing how to use Django's session auth with a react application.

The blog can be found here: https://blog.tinbrain.net/blog/session-auth-spa.html

The frontend code is based Create-React-App and is written in typescript

To run the code do the following steps:

- First clone the repository
- go to the backend directory and run migrations
- now run the server using manage.py

- In a second terminal go to the frontend directory
- install dependencies using `yarn install`
- Finally run `yarn start`

Developed and tested using:

- Python 3.7.6
- Django 3.1.1
- Node v. 12.0.0

Files containing relevant code are:

- backend/users/views.py
- frontend/src/App.tsx
