import {
  IPin,
  ITrail,
  INode,
  failureServiceResponse,
  IServiceResponse,
  IPinProperty,
} from '../types'
import { endpoint, get, post, remove, put } from '../global'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the anchor microservice */
const servicePath = 'pin/'

/**
 * [FRONTEND ANCHOR GATEWAY]
 * FrontendAnchorGateway handles HTTP requests to the host, which is located on the
 * server. This FrontendAnchorGateway object uses the baseEndpoint, and additional
 * server information to access the requested information.
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendPinGateway = {
  createPin: async (pin: IPin): Promise<IServiceResponse<IPin>> => {
    try {
      return await post<IServiceResponse<IPin>>(baseEndpoint + servicePath + 'create', {
        pin: pin,
      })
    } catch (exception) {
      return failureServiceResponse('[createPin] Unable to access backend')
    }
  },

  deletePin: async (pinId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await remove<IServiceResponse<IPin>>(baseEndpoint + servicePath + pinId)
    } catch (exception) {
      return failureServiceResponse('[deletePin] Unable to access backend')
    }
  },

  deletePins: async (pinIds: string[]): Promise<IServiceResponse<{}>> => {
    try {
      return await post<IServiceResponse<{}>>(baseEndpoint + servicePath + 'delete', {
        pinIds: pinIds,
      })
    } catch (exception) {
      return failureServiceResponse('[deletePins] Unable to access backend')
    }
  },

  getPin: async (pinId: string): Promise<IServiceResponse<IPin>> => {
    try {
      return await get<IServiceResponse<IPin>>(baseEndpoint + servicePath + pinId)
    } catch (exception) {
      return failureServiceResponse('[getPin] Unable to access backend')
    }
  },

  getPins: async (pinIds: string[]): Promise<IServiceResponse<IPin[]>> => {
    try {
      return await post<IServiceResponse<IPin[]>>(
        baseEndpoint + servicePath + 'getPinsById',
        {
          pindIds: pinIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getPin] Unable to access backend')
    }
  },

  getPinsByNodeId: async (nodeId: string): Promise<IServiceResponse<IPin[]>> => {
    try {
      return await get<IServiceResponse<IPin[]>>(
        baseEndpoint + servicePath + 'getByNodeId/' + nodeId
      )
    } catch (exception) {
      return failureServiceResponse('[getPinsByNodeId] Unable to access backend')
    }
  },

  getTrailsByPinId: async (pinId: string): Promise<IServiceResponse<ITrail[]>> => {
    try {
      return await get<IServiceResponse<ITrail[]>>(
        baseEndpoint + servicePath + 'getTrailsByPinId/' + pinId
      )
    } catch (exception) {
      return failureServiceResponse('[getTrailsByPinId] Unable to access backend')
    }
  },

  getChildNodes: async (pinId: string): Promise<IServiceResponse<INode[]>> => {
    try {
      return await get<IServiceResponse<INode[]>>(
        baseEndpoint + servicePath + 'getChildNodes/' + pinId
      )
    } catch (exception) {
      return failureServiceResponse('[getChildNodes] Unable to access backend')
    }
  },

  updatePin: async (
    pinId: string,
    properties: IPinProperty[]
  ): Promise<IServiceResponse<IPin>> => {
    try {
      return await put<IServiceResponse<IPin>>(baseEndpoint + servicePath + pinId, {
        data: properties,
      })
    } catch (exception) {
      return failureServiceResponse('[updatePin] Unable to access backend')
    }
  },

  search: async (input: string): Promise<IServiceResponse<string[]>> => {
    try {
      const path = baseEndpoint + servicePath + 'search/' + `${input}/`
      return await get<IServiceResponse<string[]>>(path)
    } catch (exception) {
      return failureServiceResponse('[search] Unable to access backend')
    }
  },
}
