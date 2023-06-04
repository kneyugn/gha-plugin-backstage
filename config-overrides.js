const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin")
const deps = require('./package.json').dependencies

module.exports = function override(config, env) {
    // without config.output, host thinks it should get assets from itself, i.e. http://localhost:4200/static vs http://localhost:3000/static
    config.output = {
        filename: "bundle.js",
        publicPath: "auto",
        uniqueName: "mfe4",
    }
    config.plugins.push(new ModuleFederationPlugin({
        name: "gha",
        library: { type: "var", name: "gha" },
        filename: "remoteEntry.js",
        exposes: {
            "./gha": "./src/App.tsx",
        },
        shared: {
            react: {
                eager: true,  
                singleton: true,
                requiredVersion: deps["react"],
            },
            "react-dom": {
                eager: true,
                singleton: true,
                requiredVersion: deps["react-dom"],
            },
      },
    }))
    return config;
}