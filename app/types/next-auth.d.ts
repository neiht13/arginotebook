import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            uId: string,
            xId: string,
            email: string,
            name: string,
            image: string,
            status: string,
            role: string[]
        }
    }
}