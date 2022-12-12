import {
  IServiceResponse,
  failureServiceResponse,
  successfulServiceResponse,
  IPin,
  isIPin,
} from '../types'
import { MongoClient } from 'mongodb'
import { type } from 'os'

/**
 * PinCollectionConnection acts as an in-between communicator between
 * the MongoDB database and BackendPinGateway. PinCollectionConnection
 * defines methods that interact directly with MongoDB. That said,
 * it does not include any of the complex logic that BackendPinGateway has.
 * Note, currently, BackendPinGateway is very simple. But as we add more complexity
 * to our system, we will implement that logic in BackendPinGateway.
 *
 * @param {MongoClient} client
 * @param {string} collectionName
 */
export class PinCollectionConnection {
  client: MongoClient
  collectionName: string

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.client = mongoClient
    this.collectionName = collectionName ?? 'pins'
  }

  /**
   * Inserts a new pin into the database
   * Returns successfulServiceResponse with IPin that was inserted as the payload
   *
   *
   * @param {IPin} pin
   * @return successfulServiceResponse<IPin> if successful insertion
   *         failureServiceResponse if failed to insert
   */
  async insertPin(pin: IPin): Promise<IServiceResponse<IPin>> {
    if (!isIPin(pin)) {
      return failureServiceResponse(
        'Failed to insert pin due to improper input ' +
          'to pinCollectionConnection.insertPin'
      )
    }
    const insertResponse = await this.client
      .db()
      .collection(this.collectionName)
      .insertOne(pin)
    if (insertResponse.insertedCount) {
      return successfulServiceResponse(insertResponse.ops[0])
    }
    return failureServiceResponse(
      'Failed to insert pin, insertCount: ' + insertResponse.insertedCount
    )
  }

  /**
   * Clears the entire pin collection in the database.
   *
   *
   * @return successfulServiceResponse<{}> on success
   *         failureServiceResponse on failure
   */
  async clearPinCollection(): Promise<IServiceResponse<{}>> {
    const response = await this.client.db().collection(this.collectionName).deleteMany({})
    if (response.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to clear pin collection.')
  }

  /**
   * Finds Pin by its unique pinId
   *
   *
   * @param {string} pinId
   * @return successfulServiceResponse<IPin> on success
   *         failureServiceResponse on failure
   */
  async findPinById(pinId: string): Promise<IServiceResponse<IPin>> {
    const findResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOne({ pinId: pinId })
    if (findResponse == null) {
      return failureServiceResponse('Failed to find pin with this pinId.')
    } else {
      return successfulServiceResponse(findResponse)
    }
  }

  /**
   * Finds pins when given a list of pinIds.
   * Note, we return successfulServiceResponse with empty array when no pins found.
   *
   *
   * @param {string[]} pinIds
   * @return successfulServiceResponse<IPin[]>
   */
  async findPinsById(pinIds: string[]): Promise<IServiceResponse<IPin[]>> {
    const foundPins: IPin[] = []
    await this.client
      .db()
      .collection(this.collectionName)
      .find({ pinId: { $in: pinIds } })
      .forEach(function(doc) {
        foundPins.push(doc)
      })
    return successfulServiceResponse(foundPins)
  }

  /**
   * Deletes pin with the given pinId.
   *
   *
   * @param {string} pinId
   * @return successfulServiceResponse<IPin> on success
   *         failureServiceResponse on failure
   */
  async deletePin(pinId: string): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const deleteResponse = await collection.deleteOne({ pinId: pinId })
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete')
  }

  /**
   * Deletes pins when given a list of pinIds.
   *
   *
   * @param {string[]} pinIds
   * @return successfulServiceResponse<IPin> on success
   *         failureServiceResponse on failure
   */
  async deletePins(pinIds: string[]): Promise<IServiceResponse<{}>> {
    const collection = await this.client.db().collection(this.collectionName)
    const myQuery = { pinId: { $in: pinIds } }
    const deleteResponse = await collection.deleteMany(myQuery)
    if (deleteResponse.result.ok) {
      return successfulServiceResponse({})
    }
    return failureServiceResponse('Failed to delete pins')
  }

  /**
   * Finds and returns all pins attached to a given node.
   *
   * @param {string[]} pinIds
   * @return successfulServiceResponse<IPin> on success
   *         failureServiceResponse on failure
   */
  async findPinsByNodeId(nodeId: string): Promise<IServiceResponse<IPin[]>> {
    const foundPins = []
    const myQuery = { nodeId: nodeId }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(myQuery)
      .forEach(function(doc) {
        foundPins.push(doc)
      })
    return successfulServiceResponse(foundPins)
  }

  /**
   * Updates pin when given a pinId and a set of properties to update.
   *
   * @param {string} pinId
   * @param {Object} properties to update in MongoDB
   * @return successfulServiceResponse<INode> on success
   *         failureServiceResponse on failure
   */
  async updatePin(
    pinId: string,
    updatedProperties: Object
  ): Promise<IServiceResponse<IPin>> {
    const updateResponse = await this.client
      .db()
      .collection(this.collectionName)
      .findOneAndUpdate(
        { pinId: pinId },
        { $set: updatedProperties },
        { returnDocument: 'after' }
      )
    if (updateResponse.ok && updateResponse.lastErrorObject.n) {
      return successfulServiceResponse(updateResponse.value)
    }
    return failureServiceResponse(
      'Failed to update pin, lastErrorObject: ' +
        updateResponse.lastErrorObject.toString()
    )
  }

  async search(input: string, typeFilter: string[] | undefined): Promise<IServiceResponse<string[]>> {
    const modInput = "\\" + "'" + input + "\\" + "'"
    const foundPins: string[] = []
    let query: any = { $text: { $search: modInput }} // default query
    let sort: any = { score: { $meta: 'textScore' }} // default sort

    // Modify query and sort variables based on type and date filter status, respectively
    if (typeFilter !== undefined) query = { $text: { $search: modInput}, 'type': {$in: typeFilter} }
    
    // get relevant properties from the projection
    const projection = {
      _id: 0,
      title: 1,
      nodeId: 1,
    }
    await this.client
      .db()
      .collection(this.collectionName)
      .find(query)
      .sort(sort)
      .project(projection).forEach(function(doc) {
        foundPins.push(doc)
      })
    return successfulServiceResponse(foundPins) 
  }
}
