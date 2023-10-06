import tmi from "tmi.js"
import dateFormat from "dateformat"
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

	const getCurrentTime = () => {
		const d = new Date()
		return `[${dateFormat(d, "yyyy-mm-dd HH:MM:ss")}]`
	}

	const client = new tmi.client(tmiOptions)
	client.connect()

	client.on("logon", () => {
		console.log(
			`${getCurrentTime()} Connecting to the Twitch server as user "${user}"...`
		)
	})

	client.on("join", (channel, username) => {
		if (username == user) {
			console.log(
				`${getCurrentTime()} Joined channel "${channel.substring(1)}".`
			)
		}
	})

	client.on("subgift", (channel, username, _, recipient) => {
		if (recipient.toLowerCase() == user) {
			console.log(
				`${getCurrentTime()} Received a subscription gift from user "${username}" in channel "${channel.substring(
					1
				)}"!`
			)
		}
	})

	client.on("reconnect", () => {
		console.log(
			`${getCurrentTime()} Trying to reconnect to the Twitch server...`
		)
	})

	client.on("part", (channel, username) => {
		if (username == user) {
			console.log(
				`${getCurrentTime()} Disconnected from channel "${channel.substring(
					1
				)}".`
			)
		}
	})

	client.on("disconnected", (reason) => {
		console.log(
			`${getCurrentTime()} Disconnected from the Twitch server. Reason: "${reason}".`
		)
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
