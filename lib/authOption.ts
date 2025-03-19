// lib/authOptions.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //@ts-ignore
      async authorize(credentials) {
        if (!credentials) return null;
 
        const { db } = await connectToDatabase();
        const account = await db.collection('account').findOne({
          username: credentials.username,
          password: credentials.password,
        });
        

        if (account && account.status)  {
          const user = await db.collection('user').findOne({
            username:  credentials.username
          })
          console.log("user", user);
          if(user) {
            user.role = account.role;
            console.log("user", user);
            return user;
          } else {
            return null;
          }
        
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth',
    signOut: '/auth',
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.xId = user.xId;
        token.uId = user._id;
        token.expires = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 ngày
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.xId = token.xId;
        session.user.uId = token.uId;
        session.expires = token.expires; // 3 ngày
      }
      return session;
    },
  },
};
