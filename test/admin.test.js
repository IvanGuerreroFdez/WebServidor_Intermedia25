const supertest = require('supertest')
const {app, server} = require('../app.js')
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js')
const { generateToken } = require('../utils/handleJwt')
const usersModel = require('../models/users.js')
const api = supertest(app);

let token

describe('Admin', () => {
    beforeAll(async () => {
      await new Promise(resolve => mongoose.connection.once('connected', resolve));
      await usersModel.deleteMany({});
      const hashedPassword = await hashPassword('adminpass');
      const user = await usersModel.create({
        email: 'admin@example.com',
        password: hashedPassword
      });
      token = await generateToken(user, process.env.JWT_SECRET);
    });
  
    it('Delete un User', async () => {
      await api.delete('/api/user/deleteuser')
        .auth(token, { type: 'bearer' })
        .expect(200);
    });
  
    it('Invitar compañero', async () => {
      await api.post('/api/user/invite')
        .auth(token, { type: 'bearer' })
        .send({ email: 'theiviboss083@gmail.com' })
        .expect(200);
    });
  
    afterAll(async () => {
      await usersModel.deleteMany({});
      await mongoose.connection.close();
      server.close();
    });
});