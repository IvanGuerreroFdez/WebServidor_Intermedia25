const supertest = require('supertest')
const {app, server} = require('../app.js')
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js')
const { generateToken } = require('../utils/handleJwt')
const usersModel = require('../models/users.js')
const api = supertest(app);

let token

describe('Data', () => {
    beforeAll(async () => {
      await new Promise(resolve => mongoose.connection.once('connected', resolve));
      await usersModel.deleteMany({});
      const hashedPassword = await hashPassword('test1234');
      const user = await usersModel.create({
        email: 'datauser@example.com',
        password: hashedPassword
      });
      token = await generateToken(user, process.env.JWT_SECRET);
    });
  
    it('Añadir data personal a User', async () => {
      await api.put('/api/user/personadata')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'DataUser',
          surname: 'Tester',
          nif: '12345678X'
        })
        .expect(200);
    });
  
    /* it('Mostrar data de un User', async () => {
      const response = await api.get('/api/user/persona')
        .auth(token, { type: 'bearer' })
        .expect(200);
  
      expect(response.body.email).toBe('datauser@example.com');
    }); */
  
    it('Añadir data company a User', async () => {
      await api.patch('/api/user/companydata')
        .auth(token, { type: 'bearer' })
        .send({
            companyName: "U-tad",
            cif: "A12345678",
            address: "Calle Prueba, 123",
            number: 123,
            postal: 28290,
            city: "Madrid",
            province: "Madrid",
            country: "España",
        })
        .expect(200);
    });
  
    afterAll(async () => {
      await usersModel.deleteMany({});
      await mongoose.connection.close();
      server.close();
    });
});
