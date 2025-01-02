// auth.ts
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 1) Lấy thông tin đăng nhập
        const { username, password } = credentials ?? {}

        // 2) Ví dụ: Tìm user trong DB
        //    (bạn có thể tuỳ chỉnh gọi fetch tới /api của bạn)
        //    Dưới đây là ví dụ "fake"
        if (username === "nguyenvanman" && password === "123456") {
          // Trả về object user
          return {
            id: "1",
            name: "Thien",
            username: "nguyenvanman",
            email: "nguyenvanman@example.com",
            role: "admin",
          }
        }

        // Nếu thông tin không khớp, trả về null hoặc throw error
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Gắn thêm data vào session.user nếu cần
      // Ví dụ: session.user.role = user.role
      // Lưu ý: user.* chỉ có trong authorize() => token => ...
      if (token && session.user) {
        session.user.id = token.uid
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      // Lưu user info vào token, để callback trên session có thể lấy
      if (user) {
        token.uid = user.id
        token.role = user.role
      }
      return token
    },
  },
  // Tuỳ chọn khác nếu cần ...
}

// Export ra để file [...nextauth]/route.ts dùng
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
