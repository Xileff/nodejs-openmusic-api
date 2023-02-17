# nodejs-openmusic-api
This repository is a final project assigned by Dicoding in the course "Belajar Fundamental Aplikasi Back-End"
It is about developing a RESTful API for a music application.

Tech stack :
- Node.js
- Hapi.js
- PostgreSQL
- Json Web Token(JWT)
- RabbitMQ
- Redis

Steps to run this project :
- Clone this repository
- Open the terminal in this project's directory
- Run these npm commands :
  -> npm install
  -> npm run migrate up
  -> npm run start-dev
  -> Clone the queue consumer server : https://github.com/Xileff/nodejs-openmusic-queue-consumer
  -> run the queue consumer server using the command 'node src/consumer.js'
  -> Import the Postman tests and environment
  -> Now you can run the Postman tests

Note : All Postman tests can be run automatically except the uploads. Because when this project was built, Postman hasn't supported automated file upload tests.
