import { Role } from "../../generated/prisma/enums"
import prisma from "../shared/prisma"

export const DefaultTask = async () => {
    const exist = await prisma.user.findFirst({ where: { auth: { role: Role.ADMIN } } });

    if (!exist) {
        
        const email = "admin@gmail.com"

        await prisma.user.create({
            data: {
                fname: "Admin",
                email,
                auth: {
                    create: {
                        password: "$2b$15$RvFgM4f6Mz9vQN0xCPoexuqKPWZnhYm4Yyg5sP5oQx88zoo4IDFWe",
                        email,
                        isverified: true,
                        role: Role.ADMIN
                    }
                }
            }
        })

    }

    return;
}