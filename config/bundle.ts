import esbuild from 'npm:esbuild@0.20.2'
import config from '../esbuild.config.ts'

await esbuild.build(config)
esbuild.stop()
