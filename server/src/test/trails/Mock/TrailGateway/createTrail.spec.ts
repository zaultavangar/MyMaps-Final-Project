import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { BackendTrailGateway } from '../../../../trails'
import { ITrail, makeITrail, isSameTrail } from '../../../../types'

describe('Unit Test: Create Trail', () => {
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

  test('inserts valid trail', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const response = await backendTrailGateway.createTrail(validTrail)
    expect(response.success).toBeTruthy()
    expect(response.payload).toStrictEqual(validTrail)
  })

  test('fails to insert trail with duplicate id', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1'], 'node1')
    const validResp = await backendTrailGateway.createTrail(validTrail)
    expect(validResp.success).toBeTruthy()
    const invalidTrail1: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const invalidTrail2: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node2')
    const invalidResp1 = await backendTrailGateway.createTrail(invalidTrail1)
    const invalidResp2 = await backendTrailGateway.createTrail(invalidTrail2)
    expect(invalidResp1.success).toBeFalsy()
    expect(invalidResp2.success).toBeFalsy()
  })

  test('fails to insert trail with duplicate anchors in its anchor list', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1', 'anchor1'], 'node1')
    const invalidResp = await backendTrailGateway.createTrail(validTrail)
    expect(invalidResp.success).toBeFalsy()
  })

  test('fails to insert trail when trailId is of invalid type or undefined', async () => {
    const invalidTrail = {
      trailId: 1,
      anchorList: [],
      nodeId: 'node1',
    }
    const response = await backendTrailGateway.createTrail(invalidTrail)
    expect(response.success).toBeFalsy()

    const invalidTrail2 = {
      trailId: undefined,
      anchorList: [],
      nodeId: 'node1',
    }
    const response2 = await backendTrailGateway.createTrail(invalidTrail2)
    expect(response2.success).toBeFalsy()
  })

  test('fails to insert trail when anchorList is of invalid type or undefined', async () => {
    const invalidTrail = {
      trailId: 'trail1',
      anchorList: {},
      nodeId: 'node1',
    }
    const response = await backendTrailGateway.createTrail(invalidTrail)
    expect(response.success).toBeFalsy()

    const invalidTrail2 = {
      trailId: 'trail1',
      anchorList: undefined,
      nodeId: 'node1',
    }
    const response2 = await backendTrailGateway.createTrail(invalidTrail2)
    expect(response2.success).toBeFalsy()
  })

  test('fails to insert trail when nodeId is of invalid type or undefined', async () => {
    const invalidTrail = {
      trailId: 'trail1',
      anchorList: ['anchor1'],
      nodeId: 1,
    }
    const response = await backendTrailGateway.createTrail(invalidTrail)
    expect(response.success).toBeFalsy()

    const invalidTrail2 = {
      trailId: 'trail1',
      anchorList: ['anchor1', 'anchor2'],
      nodeId: undefined,
    }
    const response2 = await backendTrailGateway.createTrail(invalidTrail2)
    expect(response2.success).toBeFalsy()
  })

  test('fails to insert trail with wrong shape', async () => {
    const invalidTrail = {
      trailId: 'trail1',
      list: [],
      nodeId: 'node',
    }
    const response = await backendTrailGateway.createTrail(invalidTrail)
    expect(response.success).toBeFalsy()
  })


})