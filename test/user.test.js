const supertest = require('supertest')
const {app, server} = require('../app.js')
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js')
const { generateToken } = require('../utils/handleJwt')
const usersModel = require('../models/users.js')
const api = supertest(app);

const initialUsers = [
    {
        email: "marcos@correo.es",
        password: "mipassword"
    }
]

let token

describe('User', () => {
    beforeAll(async () => {
        await new Promise((resolve) => mongoose.connection.once('connected', resolve));
        await usersModel.deleteMany({})

        const password = await hashPassword(initialUsers[0].password)
        const body = initialUsers[0]
        body.password = password
        const userData = await usersModel.create(body)
        userData.set("password", undefined, {strict: false})

        token = await generateToken(userData, process.env.JWT_SECRET)
    });

    it('GetUser', async () => {
    const response = await api.get('/api/user/getuser')
        .auth(token, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', /application\/json/)
        expect(response.body.email).toBe(initialUsers[0].email);
    });

    it('Registrar usuario', async () => {
        await api.post('/api/user/register')
          .send({
            email: "marcos@correo.es",
            password: "mipassword"
          })
          .expect(200);
    });

    it('Logear user y dar token', async () => {
        const response = await api.post('/api/user/login')
          .send({
            email: initialUsers.email,
            password: initialUsers.password
          })
          .expect(200)
          .expect('Content-Type', /application\/json/);
    
        expect(response.body).toHaveProperty('token');
    });
    
    afterAll(async () => {
        await usersModel.deleteMany({});
        await mongoose.connection.close();
        server.close();
    });
});






