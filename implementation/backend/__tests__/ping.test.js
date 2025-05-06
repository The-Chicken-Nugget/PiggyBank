const request = require('supertest');
const app = require('../index');   // export your express app
const { sequelize } = require('../models');
test('GET /api/ping', async()=>{
  const r = await request(app).get('/api/ping');
  expect(r.status).toBe(200);
  expect(r.body).toEqual({pong:true});
});

afterAll(async () => {
    await sequelize.close();   //closes DB pool → no open handles
});
  