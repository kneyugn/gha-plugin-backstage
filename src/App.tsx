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
import { createContext, useEffect, useState } from "react";
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
import { Alert, Color } from "@material-ui/lab";
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
} from "@backstage/catalog-model";
import { Octokit } from "@octokit/rest";

const token = localStorage.getItem("github_access_token");

export function App() {
  const [entity, setEntity] = useState(null);
  const [status, setStatus] = useState({ severity: "", message: "" });
  const [repos, setRepos] = useState([]);

  const githubApiBaseUrl = "https://api.github.com";

  const octokit = new Octokit({
    auth: token,
    baseUrl: githubApiBaseUrl,
  });

  const fetchIndividualRepo = async (owner, repoName) => {
    setStatus({ severity: "", message: "" });
    return await octokit.request(`GET /repos/${owner}/${repoName}`, {
      owner: owner,
      repo: repoName,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  };

  function handleRepoSelected(_, newValue) {
    const [owner, repoName] = newValue?.split("/") || [null, null];
    fetchIndividualRepo(owner, repoName)
      .then((data) => {
        const repoResponse = data.data;
        const entityCreated: Entity = {
          apiVersion: "backstage.io/v1alpha1",
          kind: "Component",
          metadata: {
            name: newValue,
            description: "Component with GitHub actions enabled.",
            annotations: {
              "github.com/project-slug": newValue,
              [ANNOTATION_ORIGIN_LOCATION]: `url:${repoResponse["git_url"]}`,
              [ANNOTATION_LOCATION]: `url:${repoResponse["git_url"]}`,
            },
          },
          spec: {
            type: "service",
            lifecycle: "production",
            owner: "engineering-team",
          },
        } as Entity;
        updateRepoSelected(entityCreated);
      })
      .catch((err) => {
        setStatus({
          severity: "error",
          message:
            err?.response?.data?.message ||
            "We could not retrieve the repo selected.",
        });
      });
  }

  useEffect(() => {
    const fetchData = async () => {
      setStatus({ severity: "", message: "" });
      const response = await octokit.request("GET /users/kneyugn/repos", {
        username: "kneyugn",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      const newRepos = response.data
        .filter((item) => item.private === false)
        .map((item) => ({
          full_name: item.full_name,
          description: item.description,
        }));
      setRepos(newRepos);
      handleRepoSelected(null, newRepos[0].full_name);
    };

    fetchData().catch((err) => {
      setStatus({
        severity: "error",
        message:
          err?.response?.data?.message ||
          "We could not fetch the list of repos.",
      });
    });
  }, []);

  function updateRepoSelected(newEntity) {
    setEntity(newEntity);
  }

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
    post: (post: {
      name: any;
      status: number;
      response: any;
      request: any;
    }) => {
      if (post.status !== 200) {
        setStatus({ severity: "error", message: post.response.data });
      } else {
        setStatus({ severity: "success", message: post.response.data });
      }
    },
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
  return (
    <>
      {status.severity.length > 0 && (
        <Alert severity={status.severity as Color}>{status.message}</Alert>
      )}
      <ReposAutocomplete
        handleRepoSelected={handleRepoSelected}
        token={token}
        githubApiBaseUrl={githubApiBaseUrl}
        repos={repos}
      ></ReposAutocomplete>
      {entity && (
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
      )}
    </>
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
