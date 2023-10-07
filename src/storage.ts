import { Prisma, PrismaClient, User } from "@prisma/client"

export class Storage {
	prisma: PrismaClient
	constructor() {
		this.prisma = new PrismaClient()
	}

	async disconnect() {
		await this.prisma.$disconnect()
	}

	async saveMessage(
		user: Prisma.UserCreateInput,
		message: Omit<Prisma.MessageCreateInput, "user">
	) {
		const newUser: User = await this.prisma.user.upsert({
			where: { id: user.id },
			update: user,
			create: user,
		})

		await this.prisma.message.create({
			data: {
				...message,
				user: { connect: newUser },
			},
		})
	}

	async saveLog(logEvent: Prisma.LogEventCreateInput) {
		await this.prisma.logEvent.create({ data: logEvent })
	}
}
