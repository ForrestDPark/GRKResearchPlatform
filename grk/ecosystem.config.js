
module.export = {

    apps: [{
        name : "grk-research",
        script: "dist/main.js",
        watch: true,
        env: {
            "NODE_ENV": "dev"
        }
    }]
}