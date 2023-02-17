# nodejs-openmusic-api
This repository is a final project assigned by Dicoding in the course "Belajar Fundamental Aplikasi Back-End"
It is about developing a RESTful API for a music application.

Tech stack :
1. Node.js
2. Hapi.js
3. PostgreSQL
4. Json Web Token(JWT)
5. RabbitMQ
6. Redis

Steps to run this project :
1. Clone this repository
2. Open the terminal in this project's directory
3. Run these npm commands consecutively : npm install, npm run migrate up, npm run start-dev

4. Clone the queue consumer server : https://github.com/Xileff/nodejs-openmusic-queue-consumer
5. Run the queue consumer server using the command 'node src/consumer.js'
6. Import the Postman tests and environment. Then run it

Note : All Postman tests can be run automatically except the uploads. Because when this project was built, Postman hasn't supported automated file upload tests.
