import { MongoClient } from 'mongodb'
import {
  failureServiceResponse,
  IServiceResponse,
  ITrail,
  isITrail,
  isExtent,
} from '../types'
import { TrailCollectionConnection } from './TrailCollectionConnection'

/**
 * BackendTrailGateway handles requests from TrailRouter, and calls on methods
 * in TrailCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class BackendTrailGateway {
  trailCollectionConnection: TrailCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.trailCollectionConnection = new TrailCollectionConnection(
      mongoClient,
      collectionName ?? 'trails'
    )
  }

  /**
   * Method to create a trail and insert it into the database.
   * Note, we do not check whether nodeId exists in the nodeCollection because
   * nodes and Trails are totally separate microservices - in your final project,
   * you may want to integrate both microservices together if you need more robustness.
   *
   * @param trail - The trail to be created and inserted into the database.
   * @returns IServiceResponse<ITrail> where ITrail is the trail that has just been
   *          created
   */
  async createTrail(trail: any): Promise<IServiceResponse<ITrail>> {
    // check whether is valid trail
    const isValidTrail = isITrail(trail)
    if (!isValidTrail) {
      return failureServiceResponse('Not a valid trail.')
    }
    // check whether already in database
    const trailResponse = await this.getTrailById(trail.trailId)
    if (trailResponse.success) {
      return failureServiceResponse('Trail with duplicate ID already exist in database.')
    }
    // if everything check out, insert trail
    const insertResp = await this.trailCollectionConnection.insertTrail(trail)
    return insertResp
  }

  /**
   * Method to retrieve trail with a given trailId.
   *
   * @param trailId - The TrailId of the Trail to be retrieved.
   * @returns IServiceResponse<ITrail>
   */
  async getTrailById(trailId: string): Promise<IServiceResponse<ITrail>> {
    return this.trailCollectionConnection.findTrailById(trailId)
  }

  /**
   * Method to retrieve Trail with a given TrailId.
   *
   * @param trailIds - The TrailIds of the Trails to be retrieved.
   * @returns IServiceResponse<ITrail[]>
   */
  async getTrailsById(trailIds: string[]): Promise<IServiceResponse<ITrail[]>> {
    return this.trailCollectionConnection.findTrailsById(trailIds)
  }

  /**
   * Method to delete all Trails in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.trailCollectionConnection.clearTrailCollection()
  }

  /**
   * Method to delete Trail with the given TrailId.
   * Note, this does not delete any links associated with the deleted Trail.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the Trail to delete does not exist.
   *
   * @param trailId the trailId of the trail
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteTrail(trailId: string): Promise<IServiceResponse<{}>> {
    return this.trailCollectionConnection.deleteTrail(trailId)
  }

  /**
   * Method to delete trails with given a list of trailIds.
   * Note, this does not delete any links associated with the deleted trails.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the trails to delete do not exist.
   *
   * @param trailId the trailId of the trail
   * @returns Promise<IServiceResponse<{}>>
   */
  async deleteTrails(trailIds: string[]): Promise<IServiceResponse<{}>> {
    return this.trailCollectionConnection.deleteTrails(trailIds)
  }

  /**
   * Method that gets all trails attached to a given node.
   *
   * @param nodeId the nodeId of the node to get trails for
   * @returns Promise<IServiceResponse<ITrail[]>>
   */
  async getTrailsByNodeId(nodeId: string): Promise<IServiceResponse<ITrail[]>> {
    return this.trailCollectionConnection.findTrailsByNodeId(nodeId)
  }

}
