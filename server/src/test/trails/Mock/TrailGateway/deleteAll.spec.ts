import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BackendTrailGateway } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

describe('Unit Test: Delete All', () => {
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

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all trails', async () => {
    const validTrail1: ITrail = makeITrail('trail1', [], 'node1')
    const response1 = await backendTrailGateway.createTrail(validTrail1)
    expect(response1.success).toBeTruthy()

    const validTrail2: ITrail = makeITrail('trail2', ['anchor2'], 'node2')
    const response2 = await backendTrailGateway.createTrail(validTrail2)
    expect(response2.success).toBeTruthy()

    const validTrail3: ITrail = makeITrail('trail3', ['anchor1', 'anchor2'], 'node2')
    const response3 = await backendTrailGateway.createTrail(validTrail3)
    expect(response3.success).toBeTruthy()

    const deleteAllResp = await backendTrailGateway.deleteAll()
    expect(deleteAllResp.success).toBeTruthy()

    const findTrail1Resp = await backendTrailGateway.getTrailById('link1')
    expect(findTrail1Resp.success).toBeFalsy()
    const findTrail2Resp = await backendTrailGateway.getTrailById('link2')
    expect(findTrail2Resp.success).toBeFalsy()
    const findTrail3Resp = await backendTrailGateway.getTrailById('link3')
    expect(findTrail3Resp.success).toBeFalsy()
  })
})
