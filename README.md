# Portable Developer Portal Plugins

The motivation behind this is to show an example of how plugins can be made vendor-neutral when it comes to developer portal applications.
This poc runs a Backstage plugin as a standalone micro frontend application inside of an Angular host application.

This micro-frontend entirely uses Backstage and Roadie Plugin's exposed elements (functions, components etc). 
At the top level, we provide the configurations in terms of entity, authentication, routing, and theming.
Hence, the entire application is composed of App.tsx.

Then, webpack's configurations from create-react-app are extended to include ModuleFederationPlugin plugin so that a remoteEntry.js 
is produced for the host application to consume.

https://github.com/kneyugn/gha-plugin-backstage/assets/21285877/bde74387-d6cb-4407-93fb-e6e5ef4f8b84

## Notes
- In the host application, if the routing does not match between the host and the mfe, the host will not render the mfe. You will not see errors. Instead, you will see only the element and no content in between the tags. This means that your function was executed successfully from remoteEntry.js but that the component defined is not rendering due to the routing mismatch.

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/gha/*" element={<Router />} />
    <Route path="*" element={<Navigate to="/gha" />} />
  </Routes>
<BrowserRouter>
```

In the host applications, you only need this portion to get the mfe running in the angular host. Checkout the [WebcomponentWrapper](https://github.com/angular-architects/module-federation-plugin/blob/b651f99b5c2faf7c5bb692e6a281eb83516c1e95/libs/mf-tools/src/lib/web-components/web-component-wrapper.ts#L15) implementation. When in doubt about whether the script is running successfully,I would copy and paste this component into the router file itself and replace the "WebcomponentWrapper" with a local implementation.

```typescript
const routes: Routes = [
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
```
