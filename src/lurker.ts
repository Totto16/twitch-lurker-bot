import tmi from "tmi.js"
import { Config, getConfig } from "./config"
import { Storage } from "./storage"

async function start(): Promise<Storage> {
	const config: Config | Error = getConfig("./config.json")

	if (config instanceof Error) {
		throw config
	}

	const { username, token, channels } = config

	const user = username.toLowerCase()

	const tmiOptions: tmi.Options = {
		connection: {
			reconnect: true,
			secure: true,
		},
		identity: {
			username: user,
			password: token,
		},
		channels: channels,
	}

	const storage = new Storage()

	const client = new tmi.client(tmiOptions)
	client.connect()

	client.on("logon", () => {
		storage.saveLog({
			type: "logon",
			message: `Connecting to the Twitch server as user "${user}"`,
			time: new Date(),
		})
	})

	client.on("join", (channel, username) => {
		storage.saveLog({
			type: "join",
			message: `user "${username}" joined channel "${channel.substring(
				1
			)}".`,
			time: new Date(),
		})
	})

	client.on("reconnect", () => {
		storage.saveLog({
			type: "reconnect",
			message: `Trying to reconnect to the Twitch server`,
			time: new Date(),
		})
	})

	client.on("part", (channel, username) => {
		storage.saveLog({
			type: "part",
			message: `user "${username}" disconnected from channel "${channel.substring(
				1
			)}".`,
			time: new Date(),
		})
	})

	client.on("disconnected", (reason) => {
		storage.saveLog({
			type: "disconnect",
			message: `Disconnected from the Twitch server. Reason: "${reason}".`,
			time: new Date(),
		})
	})

	client.on(
		"message",
		(
			channel: string,
			userState: tmi.ChatUserstate,
			message: string,
			_self: boolean
		) => {
			if (
				userState.username === undefined ||
				userState["user-id"] === undefined
			) {
				console.error(
					"UserState has not the whole needed information:",
					userState
				)
				return
			}

			let id: bigint
			try {
				id = BigInt(userState["user-id"])
			} catch (e) {
				return
			}

			storage
				.saveMessage(
					{ name: userState.username, id },
					{
						message,
						channel,
						time: new Date(),
					}
				)
				.then(() => {})
				.catch(console.error)
		}
	)

	return storage
}

start()
	.then((st) => st.disconnect())
	.catch(console.error)
