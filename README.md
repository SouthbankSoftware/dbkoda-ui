# dbenvy-ui
Next generation MongoDB Admin tool built with React.js

## Build tool

Webpack is used as build/assemble tool for React.js project. It defines two environments, `dev` and `prod`. 

* Dev:
    A `webpack-dev-server` is used during development mode. All the compiled code are saved in memory.
* Prod:
    All the resources including images, fonts, javascript, css will be compiled and packaged into `dist` directory in product mode.

## Installation Step

You can use `npm` or `yarn` to build the project.

* Run `yarn install` to install all dependencies.
* Run `yarn build` to build the javascript code into `dist` directory.
* Run `yarn start` to launch a `webpack-dev-server` in dev mode.

The structure of the output structure:

```
|-- dist
|   +-- images
|   +-- js
|   +-- index.html
|   +-- styles
|--
```