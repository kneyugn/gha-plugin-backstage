import { Entity } from '@backstage/catalog-model';
import { ApiProvider, ApiRegistry, ConfigApi, configApiRef, ConfigReader, errorApiRef, OAuthApi } from '@backstage/core';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { BrowserRouter } from 'react-router-dom';
import { githubActionsApiRef, GithubActionsClient } from './api';
import { Router } from './components/Router';
// import { Router } from '@backstage/plugin-github-actions'

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

  const oauthApi: OAuthApi = {
    getAccessToken: () => Promise.resolve('')
  }

  const options: {configApi: ConfigApi, githubAuthApi: OAuthApi} = {
    configApi: configApi,
    githubAuthApi: oauthApi
  }

  return (
    <BrowserRouter>
      <ApiProvider apis={ApiRegistry.from([[githubActionsApiRef, new GithubActionsClient(options)], 
        [configApiRef, configApi], [errorApiRef, errorApi]])}>
        <EntityProvider entity={entity}>
          <Router></Router>
        </EntityProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
