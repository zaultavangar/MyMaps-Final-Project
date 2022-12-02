import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

describe('Unit Test: findTrailsById', () => {
  let uri
  let mongoClient
  let trailCollectionConnection
  let mongoMemoryServer
  
  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
    })
    trailCollectionConnection = new TrailCollectionConnection(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await trailCollectionConnection.clearTrailCollection()
    expect(response.success).toBeTruthy()
  })
  
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets trails when given valid ids', async () => {
    const validTrail1: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const validTrail2: ITrail = makeITrail('trail2', ['anchor1', 'anchor3'], 'node1')
    const createResponse1 = await trailCollectionConnection.insertTrail(validTrail1)
    const createResponse2 = await trailCollectionConnection.insertTrail(validTrail2)
    expect(createResponse1.success).toBeTruthy()
    expect(createResponse2.success).toBeTruthy()
    const findTrailsByIdResp = await trailCollectionConnection.findTrailsById([
      validTrail1.trailId,
      validTrail2.trailId,
    ])
    expect(findTrailsByIdResp.success).toBeTruthy()
    expect(findTrailsByIdResp.payload.length).toBe(2)
  })

  test('success when some trails are not found', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const findTrailsByIdResp = await trailCollectionConnection.findTrailsById([
      'trail1',
      'trail2',
    ])
    expect(findTrailsByIdResp.success).toBeTruthy()
    expect(findTrailsByIdResp.payload.length).toBe(1)
  })

  test('success when trails are not found', async () => {
    const validTrail: ITrail = makeITrail('trail1', [], 'node1')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const findTrailsByIdResp = await trailCollectionConnection.findTrailsById(['trail2'])
    expect(findTrailsByIdResp.success).toBeTruthy()
    expect(findTrailsByIdResp.payload.length).toBe(0)
  })

})