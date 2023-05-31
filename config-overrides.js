const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = function override(config, env) {
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
            "./gha": "./src/index.tsx",
        }
    }))
    config.plugins.push(
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./public/*.html",
                },
            ],
        }),
    )
    return config;
}