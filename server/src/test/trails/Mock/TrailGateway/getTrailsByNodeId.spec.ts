import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
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

  test('gets trails when given valid nodeId', async () => {
    const validTrail1: ITrail = makeITrail('trail1', [], 'node1')
    const createResponse1 = await backendTrailGateway.createTrail(validTrail1)
    expect(createResponse1.success).toBeTruthy()
    const validTrail2: ITrail = makeITrail('trail2', [], 'node2')
    const createResponse2 = await backendTrailGateway.createTrail(validTrail2)
    expect(createResponse2.success).toBeTruthy()
    const validTrail3: ITrail = makeITrail('trail3', ['anchor1', 'anchor2'], 'node1')
    const createResponse3 = await backendTrailGateway.createTrail(validTrail3)
    expect(createResponse3.success).toBeTruthy()
    const validTrail4: ITrail = makeITrail('trail4', ['anchor1', 'anchor3'], 'node1')
    const createResponse4 = await backendTrailGateway.createTrail(validTrail4)
    expect(createResponse4.success).toBeTruthy()

    const getTrailByNodeIdResp = await backendTrailGateway.getTrailsByNodeId('node1')
    expect(getTrailByNodeIdResp.success).toBeTruthy()
    expect(getTrailByNodeIdResp.payload.length).toBe(3)
    const trail1 = getTrailByNodeIdResp.payload.find(
      (trail) => trail.trailId === 'trail1'
    )
    //
    console.log(trail1)
    console.log(validTrail1)
    console.log(getTrailByNodeIdResp.payload)
    //
    expect(isSameTrail(trail1, validTrail1)).toBeTruthy()
    const trail3 = getTrailByNodeIdResp.payload.find(
      (trail) => trail.trailId === 'trail3'
    )
    expect(isSameTrail(trail3, validTrail3)).toBeTruthy()
    const trail4 = getTrailByNodeIdResp.payload.find(
      (trail) => trail.trailId === 'trail4'
    )
    expect(isSameTrail(trail4, validTrail4)).toBeTruthy()
  })

  test('success with empty payload array when given invalid nodeId', async () => {
    const validTrail = makeITrail('trail1', [], 'node1')
    const createResponse = await backendTrailGateway.createTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const getTrailsByNodeIdResp = await backendTrailGateway.getTrailsByNodeId(
      'invalidNodeId'
    )
    expect(getTrailsByNodeIdResp.success).toBeTruthy()
    expect(getTrailsByNodeIdResp.payload.length).toBe(0)
  })
})
