import { z } from "zod"
import fs from "fs"

const ConfigSchema = z.object({
	username: z.string(),
	token: z.string().regex(/oauth:[\w\d]+/),
	channels: z.array(z.string()).min(1),
})

export type Config = z.infer<typeof ConfigSchema>

export function getConfig(path: string): Config | Error {
	if (!fs.existsSync(path)) {
		return new Error(`Config file doesn't exist: '${path}'`)
	}

	const content = fs.readFileSync(path).toString()

	let parsedContent: any

	try {
		parsedContent = JSON.parse(content)
	} catch (e) {
		return e as Error
	}

	const result = ConfigSchema.safeParse(parsedContent)
	if (!result.success) {
		return result.error
	}

	return result.data
}
