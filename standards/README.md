# Technical standards

Features should be in **camelcase**.
All text should be in **english** (features, comments, commit messages and github discussions).
For typing, we use **typescript** on client and server.

## Git flow

We use 3 branches :

- dev for development
- staging-frontend and staging-backend for staging
- master-frontend and master-backend for production

All commits in staging's and master's branches should be in dev.

Before opening a pull request, please run in client and server folders : `npm run test:lint`, `npm run test:types`, `npm run test:unit`

## How to refactor actual code ?

### Client

1. Put all API calls in sagas and store infos in redux store
2. Separate components in multiple small reusable components to increase modularity and separate logic in different functions
3. Create XXX.container (with connnection to redux and HOC) and XXX.component files (example in QuickToolBar)
4. Type components (example in QuickToolBar)
5. Add unit tests

### Server

1. Separate logic in different single responsibility functions
2. Use async/await and try/catch syntax
3. Type files
4. Add unit tests

## How to add logs ?

### Client

- use the logger `logger.info()`, `logger.warn()`or `logger.error()`
- Put the name of the component and of the specific function in log (example : `logger.info("[Dispositif] create a new dispositif : ", {data : XXX})`)
- Do not put logs in render

### Server

- use `logger.info()`, `logger.warn()`or `logger.error()`
- add context to the log, function name for example

## How to document code ?

- create single responsibility functions with transparent names
- in complex parts, add comments in english

## How to write good css ?

The project is currently mainly coded with scss styling, but we are more and more transitioning toward a styled-components logic that better reflect and takes advantage of the structure and composing abilities of the React framework. By keeping the style logic within each component, we avoid common pitfalls such as difficult readability and conflicting class names.
styled-components allows you to write actual CSS inside your JavaScript, enabling you to use the full power of CSS 💪 without mapping between styles and components. There are many ways to style react applications, but many find styled-components to be a more natural approach to styling components.

styled-components

Below creates two styled react components (Title, Wrapper) and renders them as children of the Header component:

```
import React from 'react';
import styled from 'styled-components';

//Create a <Title> react component that renders an h1 which is centered, palevioletred and sized at 1.5em

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;
```

Create a <Wrapper> react component that renders a section with some padding and a papayawhip background

```
const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;
```

Use them like any other React component – except they're styled!

```
function Button() {
  return (
    <Wrapper>
      <Title>
        Hello {this.props.name}, this is your first styled component!
      </Title>
      ...
    </Wrapper>
  );
}
```

You can see an example of a simple static component in /karfur/client/src/components/Frontend/Dispositif/MediaUpload/StyledTab.js
Or an example of a styled-component declared within a much complex component in /karfur/client/src/containers/Dispositif/SideTrad/ExpertSideTrad.js
