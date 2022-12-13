import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail } from '../../../../types'

describe('Unit Test: findTrailById', () => {
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

  test('gets trail when given valid id', async () => {
    const validTrail: ITrail = makeITrail(
      'trail1',
      [],
      'node1',
      'test.title',
      'test.description'
    )
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const findTrailByIdResp = await trailCollectionConnection.findTrailById('trail1')
    expect(findTrailByIdResp.success).toBeTruthy()
  })

  test('fails to get trail when given invalid id', async () => {
    const validTrail: ITrail = makeITrail(
      'trail1',
      [],
      'node1',
      'test.title',
      'test.description'
    )
    const createResponse = await trailCollectionConnection.insertTrail(validTrail)
    expect(createResponse.success).toBeTruthy()
    const findTrailByIdResp = await trailCollectionConnection.findTrailById('trail2')
    expect(findTrailByIdResp.success).toBeFalsy()
  })
})
