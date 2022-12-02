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

  test('gets trails when given valid trailIds', async () => {
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
    const validTrail5: ITrail = makeITrail('trail5', ['anchor5'], 'node2')
    const createResponse5 = await backendTrailGateway.createTrail(validTrail5)
    expect(createResponse5.success).toBeTruthy()
    const getTrailByIdResp = await backendTrailGateway.getTrailsById([
      'trail1',
      'trail2',
      'trail3',
      'trail4',
      'trail5',
    ])
    expect(getTrailByIdResp.success).toBeTruthy()
    expect(getTrailByIdResp.payload.length).toBe(5)
    const trail1 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail1')
    console.log("trail1: ", trail1)
    console.log("validtrail1: ", validTrail1)
    expect(isSameTrail(trail1, validTrail1)).toBeTruthy()
    const trail2 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail2')
    expect(isSameTrail(trail2, validTrail2)).toBeTruthy()
    const trail3 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail3')
    expect(isSameTrail(trail3, validTrail3)).toBeTruthy()
    const trail4 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail4')
    expect(isSameTrail(trail4, validTrail4)).toBeTruthy()
    const trail5 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail5')
    expect(isSameTrail(trail5, validTrail5)).toBeTruthy()

  })

  test('gets trails when given some valid trailIds', async () => {
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
    const validTrail5: ITrail = makeITrail('trail5', ['anchor5'], 'node2')
    const createResponse5 = await backendTrailGateway.createTrail(validTrail5)
    expect(createResponse5.success).toBeTruthy()
    const getTrailByIdResp = await backendTrailGateway.getTrailsById([
      'trail1',
      'trail2',
      'invalidId'
    ])
    expect(getTrailByIdResp.success).toBeTruthy()
    expect(getTrailByIdResp.payload.length).toBe(2)
    const trail1 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail1')
    expect(isSameTrail(trail1, validTrail1)).toBeTruthy()
    const trail2 = getTrailByIdResp.payload.find((trail) => trail.trailId === 'trail2')
    expect(isSameTrail(trail2, validTrail2)).toBeTruthy()
  })

  test('fails to get trail and returns empty array when given invalid id', async () => {
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
    const validTrail5: ITrail = makeITrail('trail5', ['anchor5'], 'node2')
    const createResponse5 = await backendTrailGateway.createTrail(validTrail5)
    expect(createResponse5.success).toBeTruthy()
    const getTrailByIdResp = await backendTrailGateway.getTrailsById(['invalidId'])
    expect(getTrailByIdResp.success).toBeTruthy()
    expect(getTrailByIdResp.payload.length).toBe(0)
  })

})