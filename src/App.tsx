import {
  ApiProvider,
  ApiRegistry,
  ConfigApi,
  configApiRef,
  ConfigReader,
  errorApiRef,
  OAuthApi,
} from "@backstage/core";
import { EntityProvider } from "@backstage/plugin-catalog-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  Router,
  GithubActionsClient,
  githubActionsApiRef,
} from "@backstage/plugin-github-actions";
import { createContext, useState } from "react";
import {
  createVersionedValueMap,
  createVersionedContext,
} from "@backstage/version-bridge";
import { Progress, ErrorPage } from "@backstage/core-components";
import { ThemeProvider } from "@material-ui/core";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import { ReposAutocomplete } from "./components";
import { getOrCreateGlobalSingleton, Resolver, theme } from "./resources";

const token = localStorage.getItem("github_access_token");

export function App() {
  const [entity, setEntity] = useState(null);

  function updateRepoSelected(newEntity) {
    setEntity(newEntity);
  }

  const githubApiBaseUrl = "https://api.github.com";

  const configApi: ConfigApi = new ConfigReader({
    integrations: {
      github: [
        {
          host: "github.com",
          apiBaseUrl: githubApiBaseUrl,
        },
      ],
    },
  });

  const errorApi = {
    post: () => console.log("post"),
    error$: () => {},
  };

  const githubAuthApi: OAuthApi = {
    getAccessToken: () => Promise.resolve(token ?? ""),
  };

  const options: { configApi: ConfigApi; githubAuthApi: OAuthApi } = {
    configApi: configApi,
    githubAuthApi: githubAuthApi,
  };

  const RoutingContext = getOrCreateGlobalSingleton("routing-context", () =>
    createContext<any>(undefined)
  );

  const resolver = new Resolver();
  const versionedValue = createVersionedValueMap({ 1: resolver });

  const DefaultNotFoundPage = () => (
    <ErrorPage status="404" statusMessage="PAGE NOT FOUND" />
  );

  const AppContext = createVersionedContext("app-context");
  const appContext = {
    getComponents: () => ({
      Progress: Progress,
      NotFoundErrorPage: DefaultNotFoundPage,
      BootErrorPage: DefaultNotFoundPage,
    }),
    getSystemIcon: (key: string) => {},
    getSystemIcons: () => {},
    getPlugins: () => {},
  };
  const appValue = createVersionedValueMap({ 1: appContext });

  /**
   * Note:
   * <Navigate to="/gha" will make "gha" as the default route. This is so localhost:4200/gha will load the mfe and then redirects it to its base bath
   * <Route path="/gha/*" element={<Router />} /> , the "*" is needed in "/gha/*" because without it, when visiting a child route, the binding to "gha" is lost.
   *
   */
  if (entity) {
    return (
      <ThemeProvider theme={theme}>
        <ApiProvider
          apis={ApiRegistry.from([
            [githubActionsApiRef, new GithubActionsClient(options)],
            [configApiRef, configApi],
            [errorApiRef, errorApi],
          ])}
        >
          <EntityProvider entity={entity}>
            <RoutingContext.Provider value={versionedValue}>
              <AppContext.Provider value={appValue}>
                <ReposAutocomplete
                  updateRepoSelected={updateRepoSelected}
                  token={token}
                  githubApiBaseUrl={githubApiBaseUrl}
                ></ReposAutocomplete>
                <BrowserRouter>
                  <Routes>
                    <Route path="/gha/*" element={<Router />} />
                    <Route path="*" element={<Navigate to="/gha" />} />
                  </Routes>
                </BrowserRouter>
              </AppContext.Provider>
            </RoutingContext.Provider>
          </EntityProvider>
        </ApiProvider>
      </ThemeProvider>
    );
  } else {
    return (
      <>
        <ReposAutocomplete
          updateRepoSelected={updateRepoSelected}
          token={token}
          githubApiBaseUrl={githubApiBaseUrl}
        ></ReposAutocomplete>
        <BrowserRouter>
          <Routes>
            <Route path="/gha/*" />
            <Route path="*" element={<Navigate to="/gha" />} />
          </Routes>
        </BrowserRouter>
      </>
    );
  }
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

/**
 * Critical: This creates a custom element with react logic.
 * Then in Angular host application, the WebComponentWrapper will:
 *  - 1. execute the script from remoteEntry to execute this customElements.define("gha-react-element", Mfe4Element)
 *  - 2. then document.createElement will simply create the tag in <gha-react-element></gha-react-element>
 * 
 * more info on customElements: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
 * 
 * const routes: Routes = [
    {
          path: 'gha',
          component: WebComponentWrapper,
          data: {
            type: 'script',
            remoteEntry: 'http://localhost:3023/remoteEntry.js',
            exposedModule: './gha',
            remoteName: 'gha',
            elementName: 'gha-react-element',
          } as WebComponentWrapperOptions
      },
  ];
 */
class Mfe4Element extends HTMLElement {
  connectedCallback() {
    ReactDOM.render(<App />, this);
  }
}

customElements.define("gha-react-element", Mfe4Element);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
