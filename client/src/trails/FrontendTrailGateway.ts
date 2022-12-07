import { failureServiceResponse, IServiceResponse } from '../types'
import { ITrail } from '../types/ITrail'
import { endpoint, get, post, remove } from '../global'

/** In development mode (locally) the server is at localhost:5000*/
const baseEndpoint = endpoint

/** This is the path to the anchor microservice */
const servicePath = 'trail/'

/**
 * [FRONTEND ANCHOR GATEWAY]
 * FrontendAnchorGateway handles HTTP requests to the host, which is located on the
 * server. This FrontendAnchorGateway object uses the baseEndpoint, and additional
 * server information to access the requested information.
 *
 * These methods use the get, post, put and remove http requests from request.ts
 * helper methods to make requests to the server.
 */
export const FrontendTrailGateway = {
  createTrail: async (trail: ITrail): Promise<IServiceResponse<ITrail>> => {
    try {
      return await post<IServiceResponse<ITrail>>(baseEndpoint + servicePath + 'create', {
        trail: trail,
      })
    } catch (exception) {
      return failureServiceResponse('[createTrail] Unable to access backend')
    }
  },

  getTrail: async (trailId: string): Promise<IServiceResponse<ITrail>> => {
    try {
      return await get<IServiceResponse<ITrail>>(baseEndpoint + servicePath + trailId)
    } catch (exception) {
      return failureServiceResponse('[getTrail] Unable to access backend')
    }
  },

  getTrails: async (trailIds: string[]): Promise<IServiceResponse<ITrail[]>> => {
    try {
      return await post<IServiceResponse<ITrail[]>>(
        baseEndpoint + servicePath + 'getTrailsById',
        {
          trailIds: trailIds,
        }
      )
    } catch (exception) {
      return failureServiceResponse('[getTrail] Unable to access backend')
    }
  },

  deleteTrail: async (trailId: string): Promise<IServiceResponse<{}>> => {
    try {
      return await remove<IServiceResponse<ITrail>>(baseEndpoint + servicePath + trailId)
    } catch (exception) {
      return failureServiceResponse('[deleteTrail] Unable to access backend')
    }
  },

  deleteTrails: async (trailIds: string[]): Promise<IServiceResponse<{}>> => {
    try {
      return await post<IServiceResponse<{}>>(baseEndpoint + servicePath + 'delete', {
        trailIds: trailIds,
      })
    } catch (exception) {
      return failureServiceResponse('[deleteTrails] Unable to access backend')
    }
  },

  getTrailsByNodeId: async (nodeId: string): Promise<IServiceResponse<ITrail[]>> => {
    try {
      return await get<IServiceResponse<ITrail[]>>(
        baseEndpoint + servicePath + 'getByNodeId/' + nodeId
      )
    } catch (exception) {
      return failureServiceResponse('[getTrailsByNodeId] Unable to access backend')
    }
  },

  // Methods to add/delete a specific pin at a certain index
  // Could also just do this on frontend
}
