import { Prisma, PrismaClient } from "@prisma/client"

export class Storage {
	prisma: PrismaClient
	constructor() {
		this.prisma = new PrismaClient()
	}

	async save(type: "message", data: Prisma.MessageCreateInput) {
		await this.prisma.message.create({
			data,
		})
	}
}
