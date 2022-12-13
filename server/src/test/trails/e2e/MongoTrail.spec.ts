import { MongoClient } from 'mongodb'
import { BackendTrailGateway } from '../../../trails'
import { ITrail, makeITrail } from '../../../types'
import uniqid from 'uniqid'

jest.setTimeout(50000)

describe('E2E Test: Trail CRUD', () => {
  let mongoClient: MongoClient
  let backendTrailGateway: BackendTrailGateway
  let uri: string
  let collectionName: string

  function generateTrailId() {
    return uniqid('trail.')
  }

  function generateAnchorList() {
    const anchorList = []
    for (let i = 0; i < 3; i++) {
      anchorList.push(uniqid('anchor.'))
    }
    return anchorList
  }

  function generateNodeId() {
    return uniqid('node.')
  }

  const testTrail: ITrail = makeITrail(
    generateTrailId(),
    generateAnchorList(),
    generateNodeId()
  )

  beforeAll(async () => {
    uri = process.env.DB_URI
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    collectionName = 'e2e-test-trails'
    backendTrailGateway = new BackendTrailGateway(mongoClient, collectionName)
    await mongoClient.connect()

    const getResponse = await backendTrailGateway.getTrailById(testTrail.trailId)
    expect(getResponse.success).toBeFalsy()
  })

  afterAll(async () => {
    await mongoClient.db().collection(collectionName).drop()
    const getResponse = await backendTrailGateway.getTrailById(testTrail.trailId)
    expect(getResponse.success).toBeFalsy()
    await mongoClient.close()
  })

  test('creates trail', async () => {
    const response = await backendTrailGateway.createTrail(testTrail)
    expect(response.success).toBeTruthy()
  })

  test('retrieves trail', async () => {
    const response = await backendTrailGateway.getTrailById(testTrail.trailId)
    expect(response.success).toBeTruthy()
    expect(response.payload.trailId).toEqual(testTrail.trailId)
  })

  test('deletes trail', async () => {
    const deleteResponse = await backendTrailGateway.deleteTrail(testTrail.trailId)
    expect(deleteResponse.success).toBeTruthy()

    const getResponse = await backendTrailGateway.getTrailById(testTrail.trailId)
    expect(getResponse.success).toBeFalsy()
  })
})
