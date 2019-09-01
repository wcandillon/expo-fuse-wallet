{
  "presets": ["babel-preset-expo"],
  "env": {
    "development": {
      "plugins": ["transform-react-jsx-source"]
    }
  },
	"plugins": [
   ["module-resolver", {
      "alias": {
        "randombytes": "./randombytes",
        "crypto": "crypto-browserify"
      }
    }]
  ]

}
