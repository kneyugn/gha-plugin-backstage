// import { Entity } from '@backstage/catalog-model';
// import { ApiProvider, ApiRegistry, useApi } from '@backstage/core';
// import { githubActionsApiRef } from './api';
import { Entity } from '@backstage/catalog-model';
import { BrowserRouter } from 'react-router-dom';
import { WorkflowRunsTable } from './components/WorkflowRunsTable';

function App() {
  const entity: Entity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Component",
    metadata: {
      name: "the-scaffolder-ci-cd",
      description: "Component with GitHub actions enabled.",
      annotations: {
        'github.com/project-slug': "RoadieHQ/sample-service"
      }
    },
    spec: {
      type: "service",
      lifecycle: "production",
      owner: "engineering-team"
    }
  } as Entity

  // const githubApi = useApi(githubActionsApiRef);
  // const apis = ApiRegistry.with(githubActionsApiRef, githubApi);
  
  return (
    <BrowserRouter><WorkflowRunsTable entity={entity} /></BrowserRouter>
    
    // <div>hello world</div>
  );
}

export default App;
