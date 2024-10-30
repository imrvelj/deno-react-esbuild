import esbuild from "npm:esbuild@0.20.2";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.0";

const plugins = [...denoPlugins()];
await esbuild.build({
  plugins,
  entryPoints: ["./src/main.tsx"],
  outfile: "./public/bundle.js",
  bundle: true,
  format: "esm",
  jsx: "automatic",
});

esbuild.stop();
