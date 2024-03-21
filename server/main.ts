import { Application, Context, Next, Router } from '@oak/oak'
import { serveDir } from '@std/http'
import { nerdIcons, rubiks, withDates } from '@rubiks/rubiks'

const oak = new Application()

const dev = !Deno.env.has('DENO_REGION')
const dist = dev ? '../client/dist' : './dist'
const logger = rubiks().use(nerdIcons()).use(withDates)

async function client(ctx: Context, next: Next) {
	// this code sucks but whatever it's going to have to do for now.
	const req = ctx.request
	const res = await serveDir(
		new Request(req.url, {
			headers: req.headers,
		}),
		{
			fsRoot: dist,
			showIndex: true,
      urlRoot: "client"
		},
	)
	if (res.status == 404) {
		return next()
	} else {
    Array.from(res.headers.entries()).forEach(([key, value]) => ctx.response.headers.set(key, value))
		ctx.response.body = res.body
		ctx.response.status = res.status
		ctx.respond = true
	}
}

oak.use(client)

logger.info('Starting web server.')

oak.listen({
	port: 8000,
	hostname: '0.0.0.0',
})