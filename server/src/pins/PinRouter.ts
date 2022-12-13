import express, { Request, Response, Router } from 'express'
import { MongoClient } from 'mongodb'
import { IServiceResponse, isIPin, IPin, IPinProperty } from '../types'
import { BackendPinGateway } from './BackendPinGateway'
const bodyJsonParser = require('body-parser').json()

// eslint-disable-next-line new-cap
export const PinExpressRouter = express.Router()

/**
 * PinRouter uses PinExpressRouter (an express router) to define responses
 * for specific HTTP requests at routes starting with '/pin'.
 * E.g. a post request to '/pin/create' would create a pin.
 * The PinRouter contains a BackendPinGateway so that when an HTTP request
 * is received, the PinRouter can call specific methods on BackendPinGateway
 * to trigger the appropriate response. See server/src/app.ts to see how
 * we set up PinRouter.
 */
export class PinRouter {
  BackendPinGateway: BackendPinGateway

  constructor(mongoClient: MongoClient) {
    this.BackendPinGateway = new BackendPinGateway(mongoClient)

    /**
     * Request to create pin
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.post('/create', async (req: Request, res: Response) => {
      try {
        const pin = req.body.pin
        if (!isIPin(pin)) {
          console.log('not ipin')
          res.status(400).send('not IPin!')
        } else {
          const response = await this.BackendPinGateway.createPin(pin)

          res.status(200).send(response)
        }
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to search by string
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.get('/search/:input/', async (req: Request, res: Response) => {
      try {
        const input = req.params.input // get the search input
        // set the type filter
        const response: IServiceResponse<string[]> = await this.BackendPinGateway.search(
          input
        )
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve pin by anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.get('/:pinId', async (req: Request, res: Response) => {
      try {
        const pinId = req.params.pinId
        const response: IServiceResponse<IPin> = await this.BackendPinGateway.getPinById(
          pinId
        )
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchors by nodeId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.post('/getPinsById', async (req: Request, res: Response) => {
      try {
        const pinIds = req.body.pinIds
        const response: IServiceResponse<IPin[]> =
          await this.BackendPinGateway.getPinsById(pinIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to retrieve anchors by nodeId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.get('/getByNodeId/:nodeId', async (req: Request, res: Response) => {
      try {
        const nodeId = req.params.nodeId
        const response: IServiceResponse<IPin[]> =
          await this.BackendPinGateway.getPinsByNodeId(nodeId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to update the pin with the given pinId
     *
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.put(
      '/:pinId',
      bodyJsonParser,
      async (req: Request, res: Response) => {
        try {
          const pinId = req.params.pinId
          const toUpdate: IPinProperty[] = req.body.data
          const response = await this.BackendPinGateway.updatePin(pinId, toUpdate)
          res.status(200).send(response)
        } catch (e) {
          res.status(500).send(e.message)
        }
      }
    )

    // New methods
    // PinExpressRouter.get(
    //   '/getTrailsByPinId/:pinId',
    //   async (req: Request, res: Response) => {
    //     try {
    //       const pinId = req.params.pinId
    //       const response: IServiceResponse<ITrail[]> =
    //         await this.BackendPinGateway.getTrailsByPinId(pinId)
    //       res.status(200).send(response)
    //     } catch (e) {
    //       res.status(500).send(e.message)
    //     }
    //   }
    // )

    // PinExpressRouter.get(
    //   '/getChildNodes/:pinId',
    //   async (req: Request, res: Response) => {
    //     try {
    //       const pinId = req.params.pinId
    //       const response: IServiceResponse<INode[]> =
    //         await this.BackendPinGateway.getChildNodes(pinId)
    //       res.status(200).send(response)
    //     } catch (e) {
    //       res.status(500).send(e.message)
    //     }
    //   }
    // )

    /**
     * Request to delete the pin with the given anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.delete('/:pinId', async (req: Request, res: Response) => {
      try {
        const pinId = req.params.pinId
        const response = await this.BackendPinGateway.deletePin(pinId)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })

    /**
     * Request to delete the pin with the given anchorId
     * @param req request object coming from client
     * @param res response object to send to client
     */
    PinExpressRouter.post('/delete', async (req: Request, res: Response) => {
      try {
        const pinIds = req.body.pinIds
        const response = await this.BackendPinGateway.deletePins(pinIds)
        res.status(200).send(response)
      } catch (e) {
        res.status(500).send(e.message)
      }
    })
  }

  /**
   * @returns PinRouter class
   */
  getExpressRouter = (): Router => {
    return PinExpressRouter
  }
}
