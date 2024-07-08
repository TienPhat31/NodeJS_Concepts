import request from 'supertest'
import { EventModel, IEvent } from '../../src/models/event.model'
import server from '../../src/server'
import jwt from 'jsonwebtoken'
import redisClient from '../../src/config/Redis.database'
import { authenticateJWT } from '../../src/middleware/auth.middleware'
import Joi, { ValidationError } from 'joi'
require('dotenv').config()

import userQueue from '../../src/queue/user.queue'
import emailQueue from '../../src/queue/email.queue'

describe('POST /event', () => {
  beforeAll(async () => {
    await EventModel.deleteMany({})
    userQueue.close()
    emailQueue.close()
  })

  afterAll(async () => {
    await redisClient.disconnect()
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })


  it('should add a new event and return 200 with user data', async () => {
    const eventData = {
      eventID: '1',
      eventName: 'Event shoppe tháng 5',
      maxQuantity: 15
    }

    // Mock JWT token
    const validToken = jwt.sign({ userId: 'someuserid' }, process.env.JWT_ACCESS_KEY as string)

    const saveMock = jest.spyOn(EventModel.prototype, 'save')
    saveMock.mockResolvedValue({
      ...eventData
    } as IEvent)

    const req = {
      cookies: {
        token: validToken
      }
    } as any

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as any

    const next = jest.fn()

    // Authenticate using middleware
    await authenticateJWT(req, res, next)

    const response = await request(server)
      .post('/event')
      .set('Cookie', [`token=${validToken}`])
      .send(eventData)
      .expect(200)

    console.log('Response: ', response.body)

    // Verify response body
    expect(response.body).toHaveProperty('_id')
    expect(response.body.eventName).toBe(eventData.eventName)
    expect(response.body.maxQuantity).toBe(eventData.maxQuantity)
    expect(response.status).toBe(200)

    saveMock.mockRestore()
  })
})
