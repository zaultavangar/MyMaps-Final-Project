import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

describe('Unit Test: ClearTrailCollection', () => {
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
  
  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes all trails', async () => {
    const trail1: ITrail = makeITrail('trail.1', ['anchor.1', 'anchor.2', 'anchor.3'], 'node.1')
    const trail2: ITrail = makeITrail(
      'trail.2', [
        'anchor.1', 'anchor.3', 'anchor.4', 'anchor.5'
      ], 'node.1'
    )
    const trail3: ITrail = makeITrail(
      'trail.3', [
        'anchor.6', 'anchor.7', 'anchor.8', 'anchor.9'
      ], 'node.2'
    )

    const response1 = await trailCollectionConnection.insertTrail(trail1)
    const response2 = await trailCollectionConnection.insertTrail(trail2)
    const response3 = await trailCollectionConnection.insertTrail(trail3)

    expect(response1.success).toBeTruthy()
    expect(response2.success).toBeTruthy()
    expect(response3.success).toBeTruthy()

    const clearResponse = await trailCollectionConnection.clearTrailCollection()
    expect(clearResponse.success).toBeTruthy()

    const findResp1 = await trailCollectionConnection.findTrailById('trail.1')
    const findResp2 = await trailCollectionConnection.findTrailById('trail.2')
    const findResp3 = await trailCollectionConnection.findTrailById('trail.3')

    expect(findResp1.success).toBeFalsy()
    expect(findResp2.success).toBeFalsy()
    expect(findResp3.success).toBeFalsy()

  })
})