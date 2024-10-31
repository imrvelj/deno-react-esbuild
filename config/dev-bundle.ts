import esbuild from 'npm:esbuild@0.20.2'
import config from '../esbuild.config.ts'

const watcher = Deno.watchFs(['./src'])

let timeoutId: number | undefined
;(async () => {
  for await (const _event of watcher) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      esbuild.build(config).then(() => {
        esbuild.stop()
      })
    }, 100)
  }
})()
