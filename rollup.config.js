const pkg = require("./package.json");
import { terser } from "rollup-plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

const preamble = `/**
  * slide-element
  * Author: ${pkg.author}
  * URL: ${pkg.homepage}
  */`;

const OUTPUT_DATA = [
  {
    file: pkg.main,
    format: "umd",
  },
  {
    file: pkg.module,
    format: "es",
  },
];

export default OUTPUT_DATA.map(({ file, format }) => {
  let plugins = [];

  if (isProduction) {
    plugins.push(
      terser({
        output: {
          preamble,
        },
      })
    );
  }

  return {
    input: "./src/slide-element.js",
    output: {
      file,
      format,
      name: "SlideElement",
    },
    plugins,
  };
});
