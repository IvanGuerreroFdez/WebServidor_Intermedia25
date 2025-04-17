const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const projectsModel = require('../models/project.js');
const albaranesModel = require('../models/albaran.js');
const api = supertest(app);
const path = require('path');


let token;
let clientId;
let projectId;
let albaranId;

describe('Albaranes', () => {
  beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await usersModel.deleteMany({});
    await clientsModel.deleteMany({});
    await projectsModel.deleteMany({});
    await albaranesModel.deleteMany({});

    const hashedPassword = await hashPassword('albaran1234');
    const user = await usersModel.create({
      email: 'albaran@example.com',
      password: hashedPassword,
    });

    token = await generateToken(user, process.env.JWT_SECRET);

    const client = await clientsModel.create({
      name: 'Cliente Albarán',
      cif: 'C12345678',
      address: {
        street: 'calle Albarán',
        number: 10,
        postal: 28020,
        city: 'Madrid',
        province: 'Madrid'
      },
      userId: user._id
    });

    clientId = client._id;

    const project = await projectsModel.create({
      name: 'Proyecto Albarán',
      projectCode: 'ALB01',
      code: '001',
      clientId: clientId,
      userId: user._id,
      address: {
        street: 'Proyecto Calle Albarán',
        number: 55,
        postal: 28011,
        city: 'Madrid',
        province: 'Madrid'
      }
    });

    projectId = project._id;
  });

  it('Crear un albarán (materiales)', async () => {
    const res = await api
      .post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId,
        projectId,
        format: "material",
        material: ["arena", "hierro", "plastico"],
        description: "Material de construcción Test",
        workdate: "2025-04-17"
      })
      .expect(200);

    expect(res.body.material.length).toBe(3);
    expect(res.body.format).toBe("material");
  });


  it('Crear un albarán (trabajadores)', async () => {
    const res = await api
      .post('/api/albaran/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId: clientId,
        projectId: projectId,
        format: "hours",
        workers: [
          { name: "Pedro", hours: 4 },
          { name: "Lucía", hours: 5 }
        ],
        description: "Prueba de trabajadores",
        workdate: "2025-04-16"
      })
      .expect(200);
    albaranId = res.body._id;
  });

  it('mostrar albaranes', async () => {
    const res = await api
      .get('/api/albaran/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Mostrar albarán según ID', async () => {
    const res = await api
      .get(`/api/albaran/show/${albaranId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(albaranId);
  });

  it('Firmar el albarán y generar PDF', async () => {
    const res = await api
      .post(`/api/albaran/firmar/${albaranId}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg')) 
      .expect(200);
    expect(res.body.pdf).toContain('https://');
  });

  it('Descargar el PDF del albarán', async () => {
    const res = await api
      .get(`/api/albaran/pdf/${albaranId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('Eliminar el albarán (firmado = debe fallar)', async () => {
    const res = await api
      .delete(`/api/albaran/delete/${albaranId}`)
      .auth(token, { type: 'bearer' })
      .expect(403);

    expect(res.body.message).toMatch(/firmado/i);
  });
  afterAll(async () => {
    await albaranesModel.deleteMany({});
    await projectsModel.deleteMany({});
    await clientsModel.deleteMany({});
    await usersModel.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });
});
