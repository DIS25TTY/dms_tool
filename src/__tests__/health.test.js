const request = require('supertest');
const App = require("../app")();
const app = App.expressApp();


describe('Server Health Check', () => {
  afterAll(async () => {
    // You may need to close any server-related resources here if applicable
  });

  it('Check Health Endpoint', async () => {
    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: `
        query healthCheck{
            health{
              ...on HealthSuccess{
                data{
                  message
                  success
                  uptime
                }
                success
              }
              ...on Error{
                message
                success
              }
            }
          }
        `,
        operationName: 'healthCheck',
      });

      console.log("RESSSSSSSSSSSSSSSs", response.error);
      console.log(response.statusCode);

    // expect(response.statusCode).toEqual(200);
    
    // const payload = response.body.data.health.data; // Adjust the property access based on your response structure
    // expect(payload).toHaveProperty('success');
    // expect(payload.success).toEqual(true);
    // expect(payload).toHaveProperty('message');
  });
});
