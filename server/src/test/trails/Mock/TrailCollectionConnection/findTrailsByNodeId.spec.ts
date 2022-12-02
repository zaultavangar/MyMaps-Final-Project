import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail, isSameTrail } from '../../../../types'

describe('Unit Test: findTrailByNodeId', () => {
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

  test('gets trails when given valid nodeId', async () => {
    const validTrail1 = makeITrail('trail1', ['anchor1'], 'node1')
    const createResponse1 = await trailCollectionConnection.insertTrail(validTrail1)
    expect(createResponse1.success).toBeTruthy()
    const validTrail2 = makeITrail('trail2', [], 'node1')
    const createResponse2 = await trailCollectionConnection.insertTrail(validTrail2)
    expect(createResponse2.success).toBeTruthy()
    const findTrailsByNodeIdResp = await trailCollectionConnection.findTrailsByNodeId(
      'node1'
    )
    expect(findTrailsByNodeIdResp.success).toBeTruthy()
    expect(findTrailsByNodeIdResp.payload.length).toBe(2)
    const trail1 = findTrailsByNodeIdResp.payload.find(
      (trail) => trail.trailId === 'trail1'
    )
    expect(isSameTrail(trail1, validTrail1)).toBeTruthy()
    const trail2 = findTrailsByNodeIdResp.payload.find(
      (trail) => trail.trailId === 'trail2'
    )
    expect(isSameTrail(trail2, validTrail2)).toBeTruthy()
  })

  test('returns empty array when no trails are found', async () => {
    const findTrailsByNodeIdResp = await trailCollectionConnection.findTrailsByNodeId(
      'nodeId'
    )
    expect(findTrailsByNodeIdResp.success).toBeTruthy()
    expect(findTrailsByNodeIdResp.payload.length).toBe(0)
  })

})