import { Entity } from '@backstage/catalog-model';
import { ApiProvider, ApiRegistry, ConfigApi, configApiRef, ConfigReader, errorApiRef, OAuthApi } from '@backstage/core';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { BrowserRouter, generatePath } from 'react-router-dom';
import { githubActionsApiRef, GithubActionsClient } from './api';
// import { Router } from './components/Router';
import { Router } from '@backstage/plugin-github-actions'
import { ScmAuthApi } from '@backstage/integration-react';
import { createContext } from 'react';
import {
  createVersionedValueMap,
} from '@backstage/version-bridge';


function App() {
  const entity: Entity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Component",
    metadata: {
      name: "the-scaffolder-ci-cd",
      description: "Component with GitHub actions enabled.",
      annotations: {
        'github.com/project-slug': "kneyugn/the-scaffolder"
      }
    },
    spec: {
      type: "service",
      lifecycle: "production",
      owner: "engineering-team"
    }
  } as Entity

  const configApi: ConfigApi = new ConfigReader({
    'integrations.github': [
      {
        host: 'github.com'
      }
    ],
  });

  const errorApi = {
    post: () => console.log('post'),
    error$: () => {}
  }

  const scmAuth: ScmAuthApi = {
    getCredentials: () => Promise.resolve({token: '', headers: {}})
  }

  const options: {configApi: ConfigApi, scmAuthApi: ScmAuthApi} = {
    configApi: configApi,
    scmAuthApi: scmAuth
  }


  const RoutingContext = getOrCreateGlobalSingleton('routing-context', () =>
    createContext<any>(undefined),
  );

  const resolver = new Resolver()
  const versionedValue = createVersionedValueMap({ 1: resolver });

  return (
    <BrowserRouter>
      <ApiProvider apis={ApiRegistry.from([[githubActionsApiRef, new GithubActionsClient(options)], 
        [configApiRef, configApi], [errorApiRef, errorApi]])}>
        <EntityProvider entity={entity}>
          <RoutingContext.Provider value={versionedValue}>
            <Router></Router>
          </RoutingContext.Provider>
        </EntityProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;


/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028

class Resolver {
  constructor() {}

  resolve(data) {
    return (rowData) => {
      return generatePath(data.path, rowData)
    }
  }
}

function getOrCreateGlobalSingleton<T>(
  id: string,
  supplier: () => T,
): T {
  const key = makeKey(id);

  let value = globalObject[key];
  if (value) {
    return value;
  }

  value = supplier();
  globalObject[key] = value;
  return value;
}

function getGlobalObject() {
  if (typeof window !== 'undefined' && window.Math === Math) {
    return window;
  }
  // eslint-disable-next-line no-new-func
  return Function('return this')();
}

const globalObject = getGlobalObject();

const makeKey = (id: string) => `__@backstage/${id}__`;
