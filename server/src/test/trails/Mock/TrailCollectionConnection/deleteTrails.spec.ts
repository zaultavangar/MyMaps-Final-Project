import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

describe('Unit Test: deleteTrails', () => {
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

  
  test('successfully deletes single trail', async () => {
    const validTrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const retrieveResponse = await trailCollectionConnection.findTrailById(
      validTrail.trailId
    )
    expect(retrieveResponse.success).toBeTruthy()
    const deleteResponse = await trailCollectionConnection.deleteTrails([
      validTrail.trailId,
    ])
    expect(deleteResponse.success).toBeTruthy()
    const retrieveResponse1 = await trailCollectionConnection.findTrailById(
      validTrail.trailId
    )
    expect(retrieveResponse1.success).toBeFalsy()
  })


  test('successfully deletes multiple trails', async () => {
    const validTrail1: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const createResponse1 = await trailCollectionConnection.insertTrail(validTrail1)
    expect(createResponse1.success).toBeTruthy()
    const validTrail2: ITrail = makeITrail('trail2', ['anchor3', 'anchor4'], 'node2')
    const createResponse2 = await trailCollectionConnection.insertTrail(validTrail2)
    expect(createResponse2.success).toBeTruthy()
    const deleteTrailResp = await trailCollectionConnection.deleteTrails(['trail1', 'trail2'])
    expect(deleteTrailResp.success).toBeTruthy()
    const findTrailResp1 = await trailCollectionConnection.findTrailById('trail1')
    expect(findTrailResp1.success).toBeFalsy()
    const findTrailResp2 = await trailCollectionConnection.findTrailById('trail2')
    expect(findTrailResp2.success).toBeFalsy()
  })

  test('gives success if we try to delete trails that ' + 'don\'t exist', async () => {
    const validTrail: ITrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const deleteTrailResp = await trailCollectionConnection.deleteTrails(['trail1', 'trail2'])
    expect(deleteTrailResp.success).toBeTruthy()
    const findTrailResp = await trailCollectionConnection.findTrailById('trail1')
    expect(findTrailResp.success).toBeFalsy()
  })



})
