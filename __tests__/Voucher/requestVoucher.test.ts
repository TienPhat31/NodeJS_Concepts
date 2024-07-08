import { Request, Response } from 'express'
import { EventModel, IEvent } from '../../src/models/event.model'
import { VoucherModel } from '../../src/models/voucher.model'
import emailQueue from '../../src/queue/email.queue'
import request from 'supertest'
import redisClient from '../../src/config/Redis.database'
import { v4 as uuidv4 } from 'uuid'
import userQueue from '../../src/queue/user.queue'
import server from '../../src/server'

jest.mock('../../src/models/event.model')
jest.mock('../../src/models/voucher.model')
jest.mock('../../src/queue/email.queue')

describe('POST /event/eventID/voucher', () => {
  let eventId: string
  let eventPayload: IEvent

  beforeAll(async () => {
    // Set up necessary data or clear database before running tests
    await EventModel.deleteMany({})
    await VoucherModel.deleteMany({})

    // Create an event for testing
    eventPayload = {
      eventID: '21',
      eventName: 'Test Event',
      maxQuantity: 10,
      issuedQuantity: 0
      // Add other required fields based on your schema
    } as IEvent

    const newEvent = new EventModel(eventPayload)
    await newEvent.save()
    eventId = newEvent.eventID

    console.log('EVENT ID: ', eventId)
  }, 10000)

  afterAll(async () => {
    // Clean up after all tests are done
    await EventModel.deleteMany({})
    await VoucherModel.deleteMany({})
    await server.close()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should request a voucher successfully and send an email', async () => {
    const response = await request(server)
      .post(`/event/${eventId}/voucher`)
      .send({ email: 'test@example.com' })
      .expect(200)

    expect(response.body).toHaveProperty('voucherID')
    expect(response.body).toHaveProperty('eventID', eventId.toString())
    expect(response.body).toHaveProperty('voucherCode')

    // Verify that the email job has been added to the queue
    expect(emailQueue.add).toHaveBeenCalledTimes(1)
    expect(emailQueue.add).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Your Voucher Code',
      text: expect.any(String),
      html: expect.any(String)
    })
  })
})
