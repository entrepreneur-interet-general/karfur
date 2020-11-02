# Refugies.info (formerly Karfu'R)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Refugies.info is a project to offer a better experience to refugees in France as per their integration and their administrative process. Refugies.info is a project hosted by the DIAIR (Direction Interministérielle pour l'Accueil et l'Intégration des Réfugiés), a service of the French Ministry of Interior (Ministère de l'Intérieur).

## Table of Contents

- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Available Commands](#available-commands)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Creators](#creators)
- [Contributors](#creators)
- [Community](#community)
- [License](#license)
- [Maintenance](#maintenance)
- [Support Refugies.info's Development](#support-refugies-infos-development)
- [Extras](#extras)

## Demo

The website is live and availabe at [https://refugies.info](https://refugies.info)

[![Homepage record](https://img.youtube.com/vi/o_qg4pDW0v8/0.jpg)](https://www.youtube.com/watch?v=o_qg4pDW0v8)

## Installation

### Prerequisites

- [MongoDB](https://treehouse.github.io/installation-guides/mac/mongo-mac.html)
- [Node](https://nodejs.org/en/download/) ^10.0.0
- [npm](https://nodejs.org/en/download/package-manager/)

Please note that you need mongo, the server and the client to run concurrently in different terminal session, in order to let them communicate

### Clone repo

```bash
# clone the repo
$ git clone https://github.com/refugies-info/karfur.git
```

### Prepare your secret

Create a `.env` file in the server directory with at least the following lines (values to be changed at your discretion). You can find an example of a complete env configuration in the `example-env-file-server.env` file in the root directory.

```bash
PORT = 8000
PORTIO = 8001
NODE_ENV = dev
SECRET = demo
FS_URL = http://localhost:8000
```

Then, create another `.env` file in the client directory with at least the following line (values to be changed at your discretion). You can find an example of a complete env configuration in the `example-env-file-client.env` file in the client folder.

```bash
REACT_APP_GOOGLE_API_KEY = demo
```

## Usage

Launch a mongodb instance

```bash
$ mongod
```

Open a new terminal tab and launch the server

```bash
# go into app's directory
$ cd karfur/server
# install app's dependencies
$ npm install
# serve at localhost:8000.
$ nodemon
```

Open a new terminal tab and launch the client

```bash
# go into client's directory
$ cd karfur/client
# install client's dependencies
$ npm install
# serve with hot reload at localhost:3000.
$ npm start
```

## Documentation

All the backend documentation is available on [Swagger](https://app.swaggerhub.com/apis-docs/DIAIR/Refugies.info/1.0.0)

[![Swagger screen record](https://img.youtube.com/vi/wx0mL7NG9VA/0.jpg)](https://www.youtube.com/watch?v=wx0mL7NG9VA)

## Available Commands

In the client directory, the following commands are available

1. `npm start` - starts the development server on port 3000 with hot reloading enabled

2. `npm run build` - builds for production with minification

3. `npm run test` - starts the unit test runner (unit, jest, lint)

4. `npm run test-with-coverage` - generates test coverage report (jest) (pending bug fix)

5. `npm run nwtest` - starts the end-to-end test runner (nightwatch)

6. `npm run cypress:open` - starts the end-to-end test runner (cypress)

## Contributing

Please read through our [contributing guidelines](https://github.com/entrepreneur-interet-general/karfur/blob/master/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

Editor preferences are available in the [editor config](https://github.com/entrepreneur-interet-general/karfur/blob/master/.editorconfig) for easy use in common text editors. Read more and download plugins at <http://editorconfig.org>.

## Team

**Agathe Kieny** developper

**Luca Mazzi** developper

**Hugo Stephan**, designer

- <https://hugostephan.com>
- <https://twitter.com/hugostephan>

**Nour Allazkani**, business developer

- <https://www.linkedin.com/in/nour-allazkani-782404140>

**Chloé Vermeulin**, computer graphics designer

- <https://www.linkedin.com/in/chlo%C3%A9-vermeulin-a3773069>

## Previous team

**Soufiane Lamrissi**, web developer

- <https://github.com/Tony4469>
- <https://www.linkedin.com/in/soufiane-lamrissi-15b79261/>
- <https://twitter.com/Wriri>

**Emily Reese**, content designer

- <https://www.linkedin.com/in/eclairereese>
- <https://github.com/emilyreese>
- <https://twitter.com/eclairereese>

## Community

Get updates on Refugies.info's development and chat with the project maintainers and community members.

- Join us and subscribe to our [Mighty Network](https://refugies-info.mn.co).
- Create new content request in our [Canny](https://refugies.canny.io).
- Checkout our [help center](https://help.refugies.info/fr/).

## License

Copyright 2019 DIAIR. Code released under [the MIT license](https://github.com/entrepreneur-interet-general/karfur/blob/master/LICENSE.md).

All the [Streamline Icons](https://streamlineicons.com/) are copyrighted and the property of Webalys LLC and can be used only in the context of this particuliar open source project. We - [Délégétation interministérielle à l’accueil et l’intégration des réfugiés](https://accueil-integration-refugies.fr/) own a premium license authorizing us to use up to 100 icons on our websites. More information can be found [here](https://www.notion.so/Premium-License-19ab1e1b9ebb4244b4a4e5c0062d4443).

## Maintenance

The project is actively maintained at least until the end of 2022 by the DIAIR, in the French Ministry of Interior.

## Support Refugies.info's Development

Refugies.info is an MIT licensed open source project and completely free to use. However, we are a small team . You can support development by offering :

- data science services
- translation services
- design services (UX/UI)
- contacts of associations working with refugees, or contact of refugees directly with their agreement

## Extras

If you liked this project, please give it a ⭐ in [**GitHub**](https://github.com/entrepreneur-interet-general/karfur).
