import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendTrailGateway } from '../../../../trails'
import { ITrail, makeITrail, isSameTrail } from '../../../../types'

describe('Unit Test: Delete Trail', () => {
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

  test('deletes trail', async () => {
    const validTrail1: ITrail = makeITrail('trail1', [], 'node1')
    const createResp = await backendTrailGateway.createTrail(validTrail1)
    expect(createResp.success).toBeTruthy()
    const deleteResp = await backendTrailGateway.deleteTrail('trail1')
    expect(deleteResp.success).toBeTruthy()
    const getResp = await backendTrailGateway.getTrailById(validTrail1.trailId)
    expect(getResp.success).toBeFalsy()
  })

  test('gives success when attempting to delete trail id that does not exist', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1'], 'node1')
    const createResp = await backendTrailGateway.createTrail(validTrail)
    expect(createResp.success).toBeTruthy()
    const deleteResp = await backendTrailGateway.deleteTrail('trail2')
    expect(deleteResp.success).toBeTruthy()
  })
})
