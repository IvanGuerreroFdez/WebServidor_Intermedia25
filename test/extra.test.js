const supertest = require('supertest')
const {app, server} = require('../app.js')
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js')
const { generateToken } = require('../utils/handleJwt')
const usersModel = require('../models/users.js')
const api = supertest(app);

let token

describe('Extra', () => {
    beforeAll(async () => {
      await new Promise(resolve => mongoose.connection.once('connected', resolve));
      await usersModel.deleteMany({});
      const hashedPassword = await hashPassword('extratest');
      const user = await usersModel.create({
        email: 'extra@example.com',
        password: hashedPassword
      });
      token = await generateToken(user, process.env.JWT_SECRET);
    });
  
    it('Debe dar 400 al validar', async () => {
      await api.put('/api/user/validatemail')
        .auth(token, { type: 'bearer' })
        .expect(400);
    });
  
    it('Debe dar email not found', async () => {
      await api.post('/api/user/forgotpassword')
        .send({ email: 'noexiste@correo.com' })
        .expect(404);
    });
  
    it('Debe dar 400 al probar logo', async () => {
      await api.patch('/api/user/logo')
        .auth(token, { type: 'bearer' })
        .expect(400);
    });
  
    afterAll(async () => {
      await usersModel.deleteMany({});
      await mongoose.connection.close();
      server.close();
    });
});