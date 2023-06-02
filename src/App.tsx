import { Entity } from '@backstage/catalog-model';
import { ApiProvider, ApiRegistry, ConfigApi, configApiRef, ConfigReader, errorApiRef, OAuthApi } from '@backstage/core';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { BrowserRouter, generatePath } from 'react-router-dom';
import { Router, GithubActionsClient, githubActionsApiRef } from '@backstage/plugin-github-actions'
import { createContext } from 'react';
import {
  createVersionedValueMap,
  createVersionedContext
} from '@backstage/version-bridge';
import {  Progress, ErrorPage } from '@backstage/core-components';

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

  const githubAuthApi: OAuthApi = {
    getAccessToken: () => Promise.resolve('')
  }

  const options: {configApi: ConfigApi, githubAuthApi: OAuthApi} = {
    configApi: configApi,
    githubAuthApi: githubAuthApi,
  }

  const RoutingContext = getOrCreateGlobalSingleton('routing-context', () =>
    createContext<any>(undefined),
  );

  const resolver = new Resolver()
  const versionedValue = createVersionedValueMap({ 1: resolver });

  const DefaultNotFoundPage = () => (
    <ErrorPage status="404" statusMessage="PAGE NOT FOUND" />
  );

  const AppContext = createVersionedContext('app-context');
  const appContext = {
    getComponents: () => (
      { Progress: Progress,
      NotFoundErrorPage: DefaultNotFoundPage,
      BootErrorPage: DefaultNotFoundPage }),
    getSystemIcon: (key: string) => {},
    getSystemIcons: () => {},
    getPlugins: () => {}
  }
  const appValue = createVersionedValueMap({ 1: appContext });


  return (
    <BrowserRouter>
      <ApiProvider apis={ApiRegistry.from([[githubActionsApiRef, new GithubActionsClient(options)], 
        [configApiRef, configApi], [errorApiRef, errorApi]])}>
        <EntityProvider entity={entity}>
          <RoutingContext.Provider value={versionedValue}>
            <AppContext.Provider value={appValue}>
              <Router></Router>
            </AppContext.Provider>
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
