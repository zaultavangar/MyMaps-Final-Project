import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendTrailGateway } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

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

  test('deletes valid trails', async () => {
    const validTrail1 = makeITrail('trail1', [], 'node1')
    const createResponse1 = await backendTrailGateway.createTrail(validTrail1)
    expect(createResponse1.success).toBeTruthy()
    const validTrail2 = makeITrail('trail2', ['anchor1', 'anchor2'], 'node1')
    const createResponse2 = await backendTrailGateway.createTrail(validTrail2)
    expect(createResponse2.success).toBeTruthy()
    const deleteResp = await backendTrailGateway.deleteTrails(['trail1', 'trail2'])
    expect(deleteResp.success).toBeTruthy()
    const getResp1 = await backendTrailGateway.getTrailById('trail1')
    expect(getResp1.success).toBeFalsy()
    const getResp2 = await backendTrailGateway.getTrailById('trail2')
    expect(getResp2.success).toBeFalsy()
  })

  test('success when some trailIds do not exist', async () => {
    const validTrail: ITrail = makeITrail('trail1', [], 'node1')
    const createResponse = await backendTrailGateway.createTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendTrailGateway.deleteTrails(['invalidId', 'trail1'])
    expect(deleteResp.success).toBeTruthy()
  })

  test('success when all trailIds do not exist', async () => {
    const validTrail = makeITrail('trail1', ['anchor1'], 'node1')
    const createResponse = await backendTrailGateway.createTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const deleteResp = await backendTrailGateway.deleteTrails(['invalidId'])
    expect(deleteResp.success).toBeTruthy()
  })
})
