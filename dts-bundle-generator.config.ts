const outputName = "position";

const config = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.json",
  },
  entries: [
    {
      filePath: "./src/index.ts",
      outFile: `./dist/${outputName}.es.d.ts`,
      output: {
        noBanner: true,
      },
    },
  ],
};

module.exports = config;
