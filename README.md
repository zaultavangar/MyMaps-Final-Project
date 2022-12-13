# MyMaps Final Project

## Description

### Project Goals

- The goal of the project was to make a map-based hypertext system where users can upload a map and place pins on the map to represent different locations. Each of these pins can contain a collection of documents, which include text, image, and folder nodes. When there are multiple pins on a given map, the user can create a “route” between a selection of pins and navigate between these pins using a route navigation interface
- Overall, we would say that we met our goals to create a map-based hypertext system with maps, pins, and routes. Maps are created after a user uploads an image, which expands the potential use cases to allow for both real and fantasy maps. Pins provide an intuitive way to store one or more documents at a given location on the map, and these documents can be linked to other documents in the same pin or a different pin. The routes feature also creates an easy way to organize pins into a sequence and navigate through them while viewing the documents for each pin

### Use Cases

- One potential use case would be to upload a map of a real-world place, and create pins at different points of interest on the map. For example, a user could upload a map of the US, and place pins at different locations around the country. The user could then add documents to each pin that are relevant to that location -- a pin on Salt Lake City, for example, could include pictures of the city, text documents describing personal experiences or relevant information, essentially whatever the user would like to create!
- There are many other potential use cases for this project, including creating a fantasy map and adding pins to represent different locations in the fantasy world. The user could then add documents to each pin that are relevant to that location, such as text documents describing the history of the location, pictures of the location, etc. This could be a great way to create a world-building tool for a fantasy novel or game!

### Difficulties

- One difficult aspect of the project was making sure that our interface didn’t become too complicated with the new menus and modals that we added for our features, like menus for pins and trails. Our pin menu had to be intuitive to use, but still have features for adding and viewing documents, as well as navigating between pins on a map without having to click on each pin on the map image. The menus for trails were even more complicated, with menus for creating trails, adding and removing pins from trails, reordering the pins in a given trail, viewing all of the current trails, and entering the navigation mode for a given trail. Once the user is inside the navigation mode, we had to add a navigation menu for them to navigate between the pins in the trail that did not take up too much of the screen space so that they could still see the map and pins. Overall, our new features required a lot of different menus, so it was difficult to add all of these menus and ensure that they were properly updated when changes to pins or routes were made.

### Relation to Hypertext/Hypermedia

- In terms of broader ideas from the class, our project maintains the original functionality of an interconnected system of nodes, but builds in additional features for geospatial organization of the nodes on a map and the Routes feature that is similar to [Dash](browndash.com)’s trails feature. We were inspired by the ability to organize nodes in a 2D space in Dash, and wanted to implement a similar spatial organization feature in our Hypermedia system through the context of maps. We also added an extra feature to map nodes in the form of a text box for notes under the map image. This space can be used to jot down quick ideas or convey information that is relevant to the entire map -- we were inspired by some of the annotation features that we have seen, and thought that this was a good way to be able to annotate a map! We also maintained and adapted some of the hypermedia-related functionality from our previous projects, like the search feature and graph view of links for documents-type nodes. Overall, we’re excited that we were able to implement some new hypertext features to the project based on our learning from the semester.


## Setup

From the `MyMaps-Final-Project` directory, you should `cd` into either `server` or `client` and then run the following commands:

### `yarn install`

Installs all of the project's dependencies.

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

## Deployed Backend URL



## Deployed Frontend URL



## Known Bugs

None known

## Estimated Hours Taken

30+ hours per person


