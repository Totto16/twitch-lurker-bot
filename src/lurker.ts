import tmi from "tmi.js"
import dateFormat from "dateformat"
import { getConfig } from "./config"

function start() {
	const config = getConfig("./config.json")

	if (config instanceof Error) {
		console.error(config)
		process.exit(1)
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
			userstate: tmi.ChatUserstate,
			message: string,
			self: boolean
		) => {
			console.log(new Date(), channel, userstate, message, self)
		}
	)
}

start()
