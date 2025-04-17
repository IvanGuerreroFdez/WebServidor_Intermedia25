const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const { hashPassword } = require('../utils/handlePassword');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users');
const api = supertest(app);
const path = require('path');

let token;
let userId;
let verificationCode = '';

describe('Onboarding', () => {
  beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await usersModel.deleteMany({});
  });

  it('Registro de usuario', async () => {
    const res = await api
      .post('/api/user/register')
      .send({
        email: 'testuser999@test.com',
        password: 'TestPassword123'
      })
      .expect(201);
  
    userId = res.body.user._id;
    token = res.body.token;
    const user = await usersModel.findById(userId);
    verificationCode = user.verificationCode;
    console.log('Código de verificación:', verificationCode);
    console.log('Token recibido:', token);
    console.log('Usuario creado:', res.body.user);
  });

  it('Validar email con código', async () => {
    const res = await api
      .put('/api/user/validatemail')
      .auth(token, { type: 'bearer' })
      .send({ code: verificationCode })
      .expect(200);

    expect(res.body.message).toMatch(/verificado/i);
  });

  it('Login de usuario', async () => {
    const res = await api
      .post('/api/user/login')
      .send({
        email: 'testuser999@test.com',
        password: 'TestPassword123'
      })
      .expect(200);

    expect(res.body.user.email).toBe('testuser999@test.com');
  });
  
  it('Recuperar contraseña (email válido)', async () => {
    const user = await usersModel.findOne({ email: 'testuser999@test.com' });
    if (!user) {
      throw new Error('Usuario de prueba no encontrado');
    }
  
    const res = await api
      .post('/api/user/forgotpassword')
      .send({ email: 'testuser999@test.com' })
      .expect(200);
  
    expect(res.body.message).toMatch(/enviado/i);
  });

  it('Añadir datos personales', async () => {
    const res = await api
      .put('/api/user/personadata')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Ivan',
        surname: 'Guerrero',
        nif: '12345678A'
      })
      .expect(200);

    expect(res.body.message).toBe("Datos personales actualizados con exito");
  });

  it('Actualizar datos de empresa', async () => {
    const res = await api
      .patch('/api/user/companydata')
      .auth(token, { type: 'bearer' })
      .send({
        companyName: "U-tad",
        cif: "Z12345678",
        address: "Calle Prueba, 123",
        number: 123,
        postal: 28290,
        city: "Madrid",
        province: "Madrid"
      })
      .expect(200);
  
    expect(res.body.message).toBe("Datos de la compañía actualizados con éxito");
  });

  it('Obtener usuario actual', async () => {
    const res = await api
      .get('/api/user/getuser')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.email).toBe('testuser999@test.com');
  });

  it('Invitar a un usuario guest', async () => {
    const res = await api
      .post('/api/user/invite')
      .auth(token, { type: 'bearer' })
      .send({ email: 'defibal183@dizigg.com' })
      .expect(201);
  
    expect(res.body.message).toBe("Usuario invitado correctamente");
  });

  it('Eliminar usuario', async () => {
    const userBefore = await usersModel.findById(userId);
    if (!userBefore) {
      throw new Error('Usuario a eliminar no encontrado');
    }
  
    const res = await api
      .delete('/api/user/deleteuser?soft=true')
      .auth(token, { type: 'bearer' })
      .expect(200);
  
    expect(res.body.message).toMatch(/desactivado/i);
  
    const userAfter = await usersModel.findById(userId);
    expect(userAfter.status).toBe('inactive');
  });

  it('Subir logo de empresa (simulado con la firma)', async () => {
    const res = await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .attach('logo', path.join(__dirname, 'firma.jpg'))
      .expect(200);
  
    expect(res.body.url).toContain('https://');
  });
  afterAll(async () => {
    await usersModel.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });
});
