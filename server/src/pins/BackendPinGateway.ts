import { MongoClient } from 'mongodb'
import {
  failureServiceResponse,
  IServiceResponse,
  IPin,
  isIPin,
  IPinProperty,
  isIPinProperty,
} from '../types'
import { PinCollectionConnection } from './PinCollectionConnection'

/**
 * BackendPinGateway handles requests from PinRouter, and calls on methods
 * in PinCollectionConnection to interact with the database. It contains
 * the complex logic to check whether the request is valid, before
 * modifying the database.
 */
export class BackendPinGateway {
  pinCollectionConnection: PinCollectionConnection

  constructor(mongoClient: MongoClient, collectionName?: string) {
    this.pinCollectionConnection = new PinCollectionConnection(
      mongoClient,
      collectionName ?? 'pins'
    )
  }

  /**
   * Method to create an pin and insert it into the database.
   * Note, we do not check whether nodeId exists in the nodeCollection because
   * nodes and pins are totally separate microservices - in your final project,
   * you may want to integrate both microservices together if you need more robustness.
   *
   * @param pin - The pin to be created and inserted into the database.
   * @returns IServiceResponse<IPin> where IPin is the pin that has just been
   *          created
   */
  async createPin(pin: any): Promise<IServiceResponse<IPin>> {
    // check whether is valid Pin
    const isValidPin = isIPin(pin)
    if (!isValidPin) {
      return failureServiceResponse('Not a valid pin.')
    }
    // check whether already in database
    const pinResponse = await this.getPinById(pin.pinId)
    if (pinResponse.success) {
      return failureServiceResponse('Pin with duplicate ID already exist in database.')
    }
    // if everything check out, insert pin
    const insertResp = await this.pinCollectionConnection.insertPin(pin)
    return insertResp
  }

  /**
   * Method to retrieve pin with a given pinId.
   *
   * @param pinId - The pinId of the pin to be retrieved.
   * @returns IServiceResponse<IPin>
   */
  async getPinById(pinId: string): Promise<IServiceResponse<IPin>> {
    return this.pinCollectionConnection.findPinById(pinId)
  }

  /**
   * Method to retrieve pin with a given pinId.
   *
   * @param pinIds - The pinIds of the pins to be retrieved.
   * @returns IServiceResponse<IPin[]>
   */
  async getPinsById(pinIds: string[]): Promise<IServiceResponse<IPin[]>> {
    return this.pinCollectionConnection.findPinsById(pinIds)
  }

  /**
   * Method to delete all pins in the database.
   *
   * @returns IServiceResponse<{}>
   */
  async deleteAll(): Promise<IServiceResponse<{}>> {
    return await this.pinCollectionConnection.clearPinCollection()
  }

  /**
   * Method to delete pin with the given pinId.
   * Note, this does not delete any links associated with the deleted pin.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the pin to delete does not exist.
   *
   * @param pinId the pinId of the pin
   * @returns Promise<IServiceResponse<{}>>
   */
  async deletePin(pinId: string): Promise<IServiceResponse<{}>> {
    return this.pinCollectionConnection.deletePin(pinId)
  }

  /**
   * Method to delete pins with given a list of pinIds.
   * Note, this does not delete any links associated with the deleted pins.
   * The frontend will call deleteLinks separately if needed.
   * Note, this method returns a success if the pins to delete do not exist.
   *
   * @param pinId the pinId of the pin
   * @returns Promise<IServiceResponse<{}>>
   */
  async deletePins(pinIds: string[]): Promise<IServiceResponse<{}>> {
    return this.pinCollectionConnection.deletePins(pinIds)
  }

  /**
   * Method that gets all pins attached to a given node.
   *
   * @param nodeId the nodeId of the node to get pins for
   * @returns Promise<IServiceResponse<IPin[]>>
   */
  async getPinsByNodeId(nodeId: string): Promise<IServiceResponse<IPin[]>> {
    return this.pinCollectionConnection.findPinsByNodeId(nodeId)
  }

  async updatePin(
    pinId: string,
    toUpdate: IPinProperty[]
  ): Promise<IServiceResponse<IPin>> {
    const properties: any = {}
    for (let i = 0; i < toUpdate.length; i++) {
      console.log(toUpdate[i])
      if (!isIPinProperty(toUpdate[i])) {
        return failureServiceResponse('toUpdate parameters invalid')
      }
      const fieldName = toUpdate[i].fieldName
      const value = toUpdate[i].value
      properties[fieldName] = value
    }
    const pinResponse = await this.pinCollectionConnection.updatePin(pinId, properties)
    if (!pinResponse.success) {
      return failureServiceResponse('This pin does not exist in the database!')
    }
    return pinResponse
  }

  /**
   * Method to search the database by string.
   *
   * @param input the search input
   * @param typeFilter  // string of activated type filters
   * @param dateFilter  // boolean represented whether the date created filter is on
   * @returns
   */
  async search(input: string): Promise<IServiceResponse<string[]>> {
    const queryResponse = await this.pinCollectionConnection.search(input)
    if (queryResponse.success) {
      return queryResponse
    } else {
      return failureServiceResponse('Failed to search.')
    }
  }

  // async getTrailsByPinId(pinId: string): Promise<IServiceResponse<ITrail[]>> {
  //   return this.pinCollectionConnection.getTrailsById(pinId)
  // }

  // async getChildNodes(pinId: string): Promise<IServiceResponse<INode[]>> {
  //   return this.pinCollectionConnection.getChildNodes(pinId)
  // }
}
