import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse, isITrail, ITrail } from '../types'
import { BackendTrailGateway } from './BackendTrailGateway'

// eslint-disable-next-line new-cap
export const TrailExpressRouter = express.Router()

/**
 * AnchorRouter uses AnchorExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/anchor'.
 * E.g. a post request to '/anchor/create' would create a anchor.
 * The AnchorRouter contains a BackendAnchorGateway so that when an HTTP request
 * is received, the AnchorRouter can call specific methods on BackendAnchorGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up AnchorRouter.
 */
export class TrailRouter {
  BackendTrailGateway: BackendTrailGateway

  constructor(mongoClient: MongoClient) {
    this.BackendTrailGateway = new BackendTrailGateway(mongoClient)

    /**
     * Request to create trail
     * @param req request object coming from client
     * @param res response object to send to client
     */
    TrailExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const trail = req.body.anchor
        if (!isITrail(trail)) {
          res.status(400).send('not ITrail!')
        } else {
          const response = await this.BackendTrailGateway.createTrail(trail)
          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchor by trailId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    TrailExpressRouter.get('/:trailId', async (req: Request, res: Response) => {
      try {
        const trailId = req.params.trailId
        const response: IServiceResponse<ITrail> =
          await this.BackendTrailGateway.getTrailById(trailId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve trails by trailId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    TrailExpressRouter.post('/getTrailsById', async (req: Request, res: Response) => {
      try {
        const trailIds = req.body.anchorIds
        const response: IServiceResponse<ITrail[]> =
          await this.BackendTrailGateway.getTrailsById(trailIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the trail with the given trailId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    TrailExpressRouter.delete('/:trailId', async (req: Request, res: Response) => {
      try {
        const trailId = req.params.trailId
        const response = await this.BackendTrailGateway.deleteTrail(trailId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the trail with the given trailId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    TrailExpressRouter.post('/delete', async (req: Request, res: Response) => {
      try {
        const trailIds = req.body.trailIds
        const response = await this.BackendTrailGateway.deleteTrails(trailIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns AnchorRouter class
   */
  getExpressRouter = (): Router => {
    return TrailExpressRouter
  }
}
