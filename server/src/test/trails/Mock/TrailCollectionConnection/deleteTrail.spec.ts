import { ITrail, makeITrail } from '../../../../types'
import { TrailCollectionConnection } from '../../../../trails'

import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

describe('Unit Test: deleteTrail', () => {
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
    const response = await trailCollectionConnection.clearLinkCollection()
    expect(response.success).toBeTruthy()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoMemoryServer.stop()
  })

  test('successfully deletes trail', async () => {
    const validTrail = makeITrail('trailId', ['anchor1Id', 'anchor2Id'], 'nodeId')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const deleteResponse = await trailCollectionConnection.deleteTrail(validTrail.trailId)
    expect(deleteResponse.success).toBeTruthy()
  })

  test('gives success if we try to delete trail that does not exist', async () => {
    const validTrail = makeITrail('trail1', ['anchor1', 'anchor2'], 'node1')
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const deleteInvalidTrailResp = await trailCollectionConnection.deleteTrail("trail2")
    expect(deleteInvalidTrailResp.success).toBeTruthy()
  })

})
