import express from 'express'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import { NodeRouter } from './nodes'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import { AnchorRouter } from './anchors'
import { LinkRouter } from './links'
import { TrailRouter } from './trails'
import { PinRouter } from './pins'

/* dotenv is a zero-dependency module that laods environment variables from a
.env file into process .env */
dotenv.config()
const PORT = process.env.PORT

const app = express()

// start the express web server listening on 5000
app.listen(PORT, () => {
  console.log('Server started on port', PORT)
})

/* CORS is a browser security feature that restrticts cross-origin HTTP
requests with other servers and specifies which domains access your resources.
CORS relaxes the security applied to an API */
app.use(cors())
// serve images, CSS files, and Javascript files in a directory called dist
app.use(express.static('dist'))
// app.use(express.json()) // allows us to parse json

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

const uri = process.env.DB_URI
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoClient.connect()
// node router
const myNodeRouter = new NodeRouter(mongoClient)
app.use('/node', myNodeRouter.getExpressRouter())
// anchor router
const myAnchorRouter = new AnchorRouter(mongoClient)
app.use('/anchor', myAnchorRouter.getExpressRouter())
// link router
const myLinkRouter = new LinkRouter(mongoClient)
app.use('/link', myLinkRouter.getExpressRouter())
// trail router
const myTrailRouter = new TrailRouter(mongoClient)
app.use('/trail', myTrailRouter.getExpressRouter())
// pin router
const myPinRouter = new PinRouter(mongoClient)
app.use('/pin', myPinRouter.getExpressRouter())

app.get('*', (req: Request, res: Response) => {
  res.send('MyHypermedia Backend Service')
})
