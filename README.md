# Ark RCON Tools 

This project is an attempt at building a flexible build system, defaulted with the following technology:

- [Typescript](https://www.typescriptlang.org/)
- [React](https://facebook.github.io/react)
- [webpack](https://webpack.github.io/)

## Pieces of the proverbial pie

For now and simplicity, this application includes both the FrontEnd and the BackEnd.

In the future it may be split into 2 separate projects.

### Setup/Installation

Setup should be fairly easy - after cloning the repository simply run `npm i` to install all dependencies.

Required Tooling:

- Node 7 or greater
- Python 2.x

I've found on _some_ systems, Python will place a `/path/to/python/python2.x` binary, but you'll need to symlink/copy to an explicit `python2` name for the build toolchain to find Python properly. Of course, it will have to be in your path as well to be located.

#### Windows Setup

To set up Python and a C++ build toolchain, it is suggested to utilize `windows-build-tools`:

> Run Git Bash (for Windows) or your preferred Shell/Terminal as Administrator!

```
npm i -g --production windows-build-tools
npm config set python $USERPROFILE/.windows-build-tools/python27/python.exe
```

### Build Information

Also because of the logical split, `webpack` has two separate builds - but this is managed in a modular configuration.

Abstracted settings definitions are stored in `./.config/definitions`, including build-time modifiers, plugins, rules, and other entries necessary for dev vs prod. This allows for configurations to be more legible and quickly glance at what is actually occurring without the large amount of configuration blinding you from the high-level overview.

Upon installation, `npm run build:dev:frontend_dll` is automatically ran to speed up the time it takes to start developing!

## Commands

| Command                          | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `npm install`                    | Install necessary dependencies. Also compiles `frontend_dll`. |
| `npm run clean`                  | Deletes the `_dist` output, and any build cache involved.     |
| `npm run lint`                   | Run TypeScript linter.                                        |
| `npm run test`                   | Run tests. (TBD)                                              |
| `npm run build:dev`              | Builds all parts of the project for Development.              |
| `npm run build:dev:frontend`     | Builds only the FrontEnd bundle for Development.              |
| `npm run build:dev:frontend_dll` | Builds only the FrontEnd DLL bundle for Development.          |
| `npm run build:dev:backend`      | Builds only the BackEnd bundle for Development.               |
| `npm run build:prod`             | Builds all parts of the project for Production.               |
| `npm run build:prod:frontend`    | Builds only the FrontEnd bundle for Production.               |
| `npm run build:prod:backend`     | Builds only the BackEnd bundle for Production.                |
| `npm run dev`                    | Starts Node and `webpack-dev-server` for Development.         |
| `npm start`                      | Starts up the built project in the `_dist` output folder.     |

## Env Vars

Boolean values are meant to be set to `1` or `true`

| VAR                | Description                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`         | `development`&#124;`production`; Can mostly be ignored, as build tasks set these for you.                                                                         |
| `FORCE_BUILD_DLL`  | `bool`; Forces the build of `frontend_dll` should files already exist. Useful for when you change your core dependencies.                                         |
| `SHOW_CONFIG_ONLY` | `bool`; Shows the entire WebPack configuration and exits without compiling.                                                                                       |
| `HOT`              | `bool`; Enables Hot Module Reloading, `webpack-dev-server`, and `react-hot-load` for development. Using this, you do not need to compiled the `frontend` targets. |
| `WDSPORT`          | `number`; Defines the port to run `webpack-dev-server` on. Defaults to `8080`                                                                                     |
| `SERVER_PORT`      | `number`; Defines the port to run the `node` server on. Defaults to `8080`, unless `HOT=1` which sets it to `3000`.                                               |

## Development Workflow

There's a few train of thoughts you can follow when developing: Standard dev/refresh, or Hot Module Replacement and `nodemon`.

In both cases, the `frontend_dll` will need to be built. This is _usually_ done for you upon `npm install`, but if it's missing the scripts will regenerate them for you.

In any situation, the goal is to access the server at `http://localhost:8080` to keep runtime consistent.

### Standard Development

You simply need to run the development targets:

```
npm run build:dev
```

or

```
npm run build:dev:backend
npm run build:dev:frontend
```

Then start the project as normal:

```
npm start
```

### HMR Development

Similar to Standard Development, you simply run a development npm-script, which kicks off the necessary tools for real-time development.

However, you do not need to compile any targets as it will be dynamically compiled by `webpack-dev-server` (for FrontEnd) and `WebPack`/`nodemon` (for BackEnd) as changes are detected.

```
npm run dev
```

## Building for Production

In this boilerplate, Production builds:

- include _all_ dependencies (unlike dev where they're pre-compiled into a `dll` file).
- are minified via `UglifyES`.
- run `useref` on the `index.html` file (for excluding development scripts if necessary)

```
npm run build:prod
npm start
```
