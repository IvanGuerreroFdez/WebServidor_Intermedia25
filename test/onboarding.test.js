const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const usersModel = require('../models/users');
const path = require('path');

const api = supertest(app);

// Validar y registrar usuario
async function registerAndVerifyUser(email) {
  const reg = await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const token = reg.body.token;
  const user = await usersModel.findById(reg.body.user._id);
  await api
    .put('/api/user/validatemail')
    .auth(token, { type: 'bearer' })
    .send({ code: user.verificationCode })
    .expect(200);
  return token;
}

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
});



describe('Onboarding', () => {
  it('Registro de usuario', async () => {
    const res = await api
      .post('/api/user/register')
      .send({ email: 'user1@test.com', password: 'Test1234' })
      .expect(201);
    
    expect(res.body.user.email).toBe('user1@test.com');
  });

  it('Registro fallido (email inválido)', async () => {
    await api
      .post('/api/user/register')
      .send({ email: 'invalidemail', password: '12345678' })
      .expect(422);
  });

  it('Registro fallido (sin password)', async () => {
    await api
      .post('/api/user/register')
      .send({ email: 'user2@test.com' })
      .expect(422);
  });

  it('Registro fallido (usuario ya existe)', async () => {
    await api.post('/api/user/register').send({ email: 'user3@test.com', password: 'Test1234' });
    await api
      .post('/api/user/register')
      .send({ email: 'user3@test.com', password: 'Test1234' })
      .expect(409);
  });

  it('Validar email correctamente', async () => {
    await registerAndVerifyUser('user4@test.com');
  });

  it('Validar email fallido (sin código)', async () => {
    const reg = await api.post('/api/user/register').send({ email: 'user5@test.com', password: 'Test1234' });
    const token = reg.body.token;

    await api
      .put('/api/user/validatemail')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(422);
  });

  it('Validar email fallido (código incorrecto)', async () => {
    const reg = await api.post('/api/user/register').send({ email: 'user6@test.com', password: 'Test1234' });
    const token = reg.body.token;

    await api
      .put('/api/user/validatemail')
      .auth(token, { type: 'bearer' })
      .send({ code: '000000' })
      .expect(400);
  });

  it('Login correcto', async () => {
    await api.post('/api/user/register').send({ email: 'user7@test.com', password: 'Test1234' });
    const res = await api
      .post('/api/user/login')
      .send({ email: 'user7@test.com', password: 'Test1234' })
      .expect(200);
    
    expect(res.body.user.email).toBe('user7@test.com');
  });

  it('Login fallido (email mal formado)', async () => {
    await api
      .post('/api/user/login')
      .send({ email: 'pepito', password: 'password' })
      .expect(422);
  });

  it('Login fallido (credenciales incorrectas)', async () => {
    await api.post('/api/user/register').send({ email: 'user8@test.com', password: 'Test1234' });
    await api
      .post('/api/user/login')
      .send({ email: 'user8@test.com', password: 'wrongpass' })
      .expect(400);
  });

  it('Recuperar contraseña con email válido', async () => {
    await api.post('/api/user/register').send({ email: 'user9@test.com', password: 'Test1234' });
    await api
      .post('/api/user/forgotpassword')
      .send({ email: 'user9@test.com' })
      .expect(200);
  });

  it('Recuperar contraseña sin email', async () => {
    await api
      .post('/api/user/forgotpassword')
      .send({})
      .expect(404);
  });

  it('Recuperar contraseña con email inexistente', async () => {
    await api
      .post('/api/user/forgotpassword')
      .send({ email: 'inexistente@test.com' })
      .expect(404);
  });

  it('Añadir datos personales', async () => {
    const token = await registerAndVerifyUser('user10@test.com');

    await api
      .put('/api/user/personadata')
      .auth(token, { type: 'bearer' })
      .send({ name: 'Nombre', surname: 'Apellido', nif: '12345678A' })
      .expect(200);
  });

  it('Añadir datos personales (sin nombre)', async () => {
    const token = await registerAndVerifyUser('user11@test.com');

    await api
      .put('/api/user/personadata')
      .auth(token, { type: 'bearer' })
      .send({ surname: 'Fallo', nif: '12345678A' })
      .expect(422);
  });

  it('Actualizar datos empresa correctamente', async () => {
    const token = await registerAndVerifyUser('user12@test.com');

    await api
      .patch('/api/user/companydata')
      .auth(token, { type: 'bearer' })
      .send({
        companyName: "Empresa S.A.",
        cif: "Z12345678",
        address: "Calle Falsa",
        number: 123,
        postal: 28000,
        city: "Madrid",
        province: "Madrid"
      })
      .expect(200);
  });

  it('Actualizar datos empresa (sin cif)', async () => {
    const token = await registerAndVerifyUser('user13@test.com');

    await api
      .patch('/api/user/companydata')
      .auth(token, { type: 'bearer' })
      .send({
        companyName: "Empresa Falsa",
        address: "Calle Falsa",
        number: 321,
        postal: 28001,
        city: "Madrid",
        province: "Madrid"
      })
      .expect(422);
  });

  it('Obtener usuario actual', async () => {
    const token = await registerAndVerifyUser('user14@test.com');

    await api
      .get('/api/user/getuser')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });

  it('Invitar usuario guest correctamente', async () => {
    const token = await registerAndVerifyUser('user15@test.com');

    await api
      .post('/api/user/invite')
      .auth(token, { type: 'bearer' })
      .send({ email: 'guest@correo.com' })
      .expect(201);
  });

  it('Invitar usuario guest (sin email)', async () => {
    const token = await registerAndVerifyUser('user16@test.com');

    await api
      .post('/api/user/invite')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400);
  });

  it('Eliminar usuario (soft delete)', async () => {
    const token = await registerAndVerifyUser('user17@test.com');

    await api
      .delete('/api/user/deleteuser?soft=true')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });

  it('Subir logo correctamente', async () => {
    const token = await registerAndVerifyUser('user18@test.com');

    await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .attach('logo', path.join(__dirname, 'firma.jpg'))
      .expect(200);
  });

  it('Subir logo (sin archivo)', async () => {
    const token = await registerAndVerifyUser('user19@test.com');

    await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .expect(400);
  });
});

afterAll(async () => {
  await usersModel.deleteMany({});
  await mongoose.connection.close();
  server.close();
});