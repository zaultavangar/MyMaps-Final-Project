# Unit 3: Editable Nodes

## Setup  

From the `unit3` directory, you should `cd` into either `server` or `client` and then run the following commands:

### `yarn install`

Installs all of `MyHypermedia`'s dependencies.

### `touch .env`

Creates a .env file for you to set up.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.


## Testing  
### `yarn test`

Launches the test runner in the interactive watch mode.

## Notable Design Choices

Graph: 
  For the graph view, I chose to use a static graph with no interaction, i.e. users
  cannot select/move/delete nodes or update edges from the graph.
  
  I chose to use a custom node so as to render more interesting nodes in the react flow graph. 
  The nodes in the graph display a node's title and its type. The edges between nodes have 
  the link title as the label. 

Search:
  Users can search nodes by indexing their title and content fields

  Instead of a regular search bar with results dynamically appearing in a popup below, 
  I opted for a search button on the top right which opens a search modal on click.

  Users can filter by text, image, and folder node types, as well as sort results by date 
  created (by default, results are sorted by relevancy score)/

## Deployed Backend URL

https://warm-crag-45496.herokuapp.com/

## Deployed Frontend URL

https://cs1951editablenodes.web.app/

## Capstone / Extra Credit

## Known Bugs

None known
## Estimated Hours Taken

20-30 hours


