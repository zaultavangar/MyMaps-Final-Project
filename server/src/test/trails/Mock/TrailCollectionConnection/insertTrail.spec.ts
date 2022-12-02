import { MongoClient } from 'mongodb'
import {MongoMemoryServer } from 'mongodb-memory-server'
import { TrailCollectionConnection } from '../../../../trails'
import { ITrail, makeITrail, isSameTrail } from '../../../../types'

describe('Unit Test: InsertTrail', () => {
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

  test('inserts valid trail', async () => {
    const validTrail: ITrail = makeITrail('trail1', [], 'node1')
    const response = await trailCollectionConnection.insertTrail(validTrail)
    expect(response.success).toBeTruthy()
  })

  test('fails to insert invalid document with the wrong shape', async () => {
    const invalidTrail: any = {id: 'id'}
    const response = await trailCollectionConnection.insertTrail(invalidTrail)
    expect(response.success).toBeFalsy()
  })

  test('fails to insert invalid document with correct shape', async () => {
    const invalidTrail: ITrail = makeITrail(undefined, undefined, undefined)
    const response = await trailCollectionConnection.insertTrail(invalidTrail)
    expect(response.success).toBeFalsy()
  })

})
