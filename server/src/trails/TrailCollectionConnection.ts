import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  ITrail,
  isITrail,
  Extent,
} from '../types'
import { MongoClient } from 'mongodb'

/**
 * TrailCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendTrailGateway. TrailCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendTrailGateway has.
 * Note, currently, BackendTrailGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in BackendTrailGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class TrailCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'trails'
  }

  /**
   * Inserts a new trail into the database
   * Returns successfulServiceResponse with ITrail that was inserted as the payload
   *
   *
   * @param {ITrail} trail
   * @return successfulServiceResponse<ITrail> if successful insertion
   *         failureServiceResponse if failed to insert
   */
  async insertTrail(trail: ITrail): Promise<IServiceResponse<ITrail>> {
    if (!isITrail(trail)) {
      return failureServiceResponse(
        'Failed to insert trail due to improper input ' +
          'to trailCollectionConnection.insertTrail'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(trail)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert trail, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire trail collection in the database.
   *
   *
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async clearTrailCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear trail collection.')
  }

  /**
   * Finds trail by its unique trailId
   *
   *
   * @param {string} trailId
   * @return successfulServiceResponse<ITrail> on success
   *         failureServiceResponse on failure
   */
  async findTrailById(trailId: string): Promise<IServiceResponse<ITrail>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ trailId: trailId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find trail with this trailId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds Trails when given a list of trailIds.
   * Note, we return successfulServiceResponse with empty array when no Trails found.
   *
   *
   * @param {string[]} trailIds
   * @return successfulServiceResponse<ITrail[]>
   */
  async findTrailsById(trailIds: string[]): Promise<IServiceResponse<ITrail[]>> {
    const foundTrails: ITrail[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ trailId: { $in: trailIds } })
      .forEach(function(doc) {
        foundTrails.push(doc)
      })
    return successfulServiceResponse(foundTrails)
  }

  /**
   * Deletes trail with the given trailId.
   *
   *
   * @param {string} trailId
   * @return successfulServiceResponse<ITrail> on success
   *         failureServiceResponse on failure
   */
  async deleteTrail(trailId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ trailId: trailId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }

  /**
   * Deletes Trails when given a list of trailIds.
   *
   *
   * @param {string[]} trailIds
   * @return successfulServiceResponse<ITrail> on success
   *         failureServiceResponse on failure
   */
  async deleteTrails(trailIds: string[]): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const myQuery = { trailId: { $in: trailIds } }
    const deleteResponse = await collection.deleteMany(myQuery)
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete trails')
  }

  /**
   * Finds and returns all trails attached to a given node.
   *
   * @param {string[]} trailIds
   * @return successfulServiceResponse<ITrail> on success
   *         failureServiceResponse on failure
   */
   async findTrailsByNodeId(nodeId: string): Promise<IServiceResponse<ITrail[]>> {
    const foundTrails = []
    const myQuery = { nodeId: nodeId }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundTrails.push(doc)
      })
    return successfulServiceResponse(foundTrails)
  }

  /**
   * Finds and returns all trails attached to a given pin.
   *
   * @param {string[]} trailIds
   * @return successfulServiceResponse<ITrail> on success
   *         failureServiceResponse on failure
   */
   async findTrailsByPinId(pinId: string): Promise<IServiceResponse<ITrail[]>> {
    const foundTrails = []
    const myQuery = { "pinList.pinId" : pinId }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundTrails.push(doc)
      })
    return successfulServiceResponse(foundTrails)
  }
}
