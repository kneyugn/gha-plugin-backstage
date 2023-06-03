const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin")
const deps = require('./package.json').dependencies

module.exports = function override(config, env) {
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