import { Entity } from "@backstage/catalog-model";
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
import {
  BrowserRouter,
  generatePath,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
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
import {
  Button,
  Card,
  CardActions,
  CardContent,
  createTheme,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import { yellow } from "@material-ui/core/colors";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import { Octokit } from "@octokit/rest";

const token = localStorage.getItem("github_access_token");

function Repos() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const octokit = new Octokit({
        auth: token,
      });

      const response = await octokit.request("GET /users/kneyugn/repos", {
        username: "kneyugn",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      console.log(response.data);
      const newRepos = response.data
        .filter((item) => item.private === false)
        .map((item) => ({
          full_name: item.full_name,
          description: item.description,
        }));
      setRepos(newRepos);
    };

    fetchData().catch(console.error);
  }, []);

  const repoContainerStyle = {
    display: "grid",
    "grid-template-columns": "repeat(5, 1fr)",
    "grid-gap": "16px",
  };

  return (
    <div style={repoContainerStyle} className="repos-container">
      {repos.map((repo: { full_name: string; description: string }, idx) => (
        <Card key={idx}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {repo.full_name}
            </Typography>
            <Typography variant="body2">{repo.description}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">View Actions</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
}

const theme = createTheme({
  palette: {
    type: "light",
    background: {
      default: "#F8F8F8",
    },
    status: {
      ok: "#1DB954",
      warning: "#FF9800",
      error: "#E22134",
      running: "#2E77D0",
      pending: "#FFED51",
      aborted: "#757575",
    },
    bursts: {
      fontColor: "#FEFEFE",
      slackChannelText: "#ddd",
      backgroundColor: {
        default: "#7C3699",
      },
    },
    primary: {
      main: "#2E77D0",
    },
    banner: {
      info: "#2E77D0",
      error: "#E22134",
      text: "#FFFFFF",
      link: "#000000",
    },
    border: "#E6E6E6",
    textContrast: "#000000",
    textVerySubtle: "#DDD",
    textSubtle: "#6E6E6E",
    highlight: "#FFFBCC",
    errorBackground: "#FFEBEE",
    warningBackground: "#F59B23",
    infoBackground: "#ebf5ff",
    errorText: "#CA001B",
    infoText: "#004e8a",
    warningText: "#000000",
    linkHover: "#2196F3",
    link: "#0A6EBE",
    gold: yellow.A700,
    navigation: {
      background: "#171717",
      indicator: "#9BF0E1",
      color: "#b5b5b5",
      selectedColor: "#FFF",
    },
    pinSidebarButton: {
      icon: "#181818",
      background: "#BDBDBD",
    },
    tabbar: {
      indicator: "#9BF0E1",
    },
  },
  defaultPageTheme: "home",
} as any);

export function App() {
  const entity: Entity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Component",
    metadata: {
      name: "the-scaffolder-ci-cd",
      description: "Component with GitHub actions enabled.",
      annotations: {
        "github.com/project-slug": "angular/angular",
      },
    },
    spec: {
      type: "service",
      lifecycle: "production",
      owner: "engineering-team",
    },
  } as Entity;

  const configApi: ConfigApi = new ConfigReader({
    integrations: {
      github: [],
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
              <Repos></Repos>
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
      // this is so all links to details will prefix "/gha/"
      return "/gha/" + generatePath(data.path, rowData);
    };
  }
}

function getOrCreateGlobalSingleton<T>(id: string, supplier: () => T): T {
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
  if (typeof window !== "undefined" && window.Math === Math) {
    return window;
  }
  // eslint-disable-next-line no-new-func
  return Function("return this")();
}

const globalObject = getGlobalObject();

const makeKey = (id: string) => `__@backstage/${id}__`;

class Mfe4Element extends HTMLElement {
  connectedCallback() {
    ReactDOM.render(<App />, this);
  }
}

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
customElements.define("gha-react-element", Mfe4Element);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
