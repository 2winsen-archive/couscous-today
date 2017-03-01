module.exports = {
    "env": {
        "es6": true,
        "mocha": true,
        "node": true,
        "jasmine": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4,
            { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-console": 0
    },
    "globals": [
        "const"
    ]
};