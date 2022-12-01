import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { BackendTrailGateway } from '../../../../trails'
import { ITrail, makeITrail, isSameTrail } from '../../../../types'

describe('Unit Test: Delete Trails', () => {
  let uri: string
  let mongoClient: MongoClient
  let backendTrailGateway: BackendTrailGateway
  let mongoMemoryServer: MongoMemoryServer
  
  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    uri = mongoMemoryServer.getUri()
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
    })
    backendTrailGateway = new BackendTrailGateway(mongoClient)
    mongoClient.connect()
  })

  beforeEach(async () => {
    const response = await backendTrailGateway.deleteAll()
    expect(response.success).toBeTruthy()
  })
  
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('gets trail when given valid id', async () => {
    const validTrail: ITrail = makeITrail('trail1', [], 'node1')
    const createResponse = await backendTrailGateway.createTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const getTrailByIdResp = await backendTrailGateway.getTrailById('trail1')
    expect(getTrailByIdResp.success).toBeTruthy()
  })

  test('fails to get trail when given invalid id', async () => {
    const validTrail: ITrail = makeITrail('trail1', [], 'node1')
    const createResponse = await backendTrailGateway.createTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const getTrailByIdResp = await backendTrailGateway.getTrailById('trail2')
    expect(getTrailByIdResp.success).toBeFalsy()
  })

})