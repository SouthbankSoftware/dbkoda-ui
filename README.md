# dbKoda UI
*dbKoda UI built with state of the art React stack*

## Build tool

Webpack is used as build/assemble tool for React.js project. It defines two environments, `dev` and `prod`.

* Dev:
    A `webpack-dev-server` is used during development mode. All the compiled code are saved in memory.
* Prod:
    All the resources including images, fonts, javascript, css will be compiled and packaged into `dist` directory in product mode.

## Installation Step

You can use `npm` or `yarn` to build the project.

* **Note**: you may need to run `npm login` and login using the credentials on 1Password before building.
* Run `yarn install` to install all dependencies.
* Run `yarn build` to build the javascript code into `dist` directory.
* Run `yarn start` to launch a `webpack-dev-server` in dev mode.

## Run Steps

Currently you need to run the Controller seperately to the product.

* Run `npm run start` in the dbkoda-Controller repository.
* Run `npm run start` or `yarn start` in the dbkoda-ui repository.

The structure of the output structure:

```text
dbkoda-ui
├── dist
│   ├── images
│   ├── js
│   ├── index.html
│   └── styles
```
