// lib/authOptions.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
 
        const { db } = await connectToDatabase();
        const account = await db.collection('account').findOne({
          username: credentials.username,
          password: credentials.password,
        });
        
        if (account && account.status)  {
          const user = await db.collection('user').findOne({
            username: credentials.username
          });
          if(user) {
            user.role = account.role;
            return user;
          }
          return null;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const { db } = await connectToDatabase();
      
      if (account.provider === 'google') {
        const existingUser = await db.collection('user').findOne({
          email: user.email,
        });

        if (!existingUser) {
          // Tạo mới account
          const newAccount = {
            username: user.email.split('@')[0], // Lấy phần trước @ làm username
            password: null, // Không cần password cho Google auth
            role: ['USER'], // Default role
            xId: null, // Sẽ cập nhật sau qua form
            status: false,
            createdBy: 'system',
            createAt: new Date(),
            lastlogAt: null,
          };
          const accountResult = await db.collection('account').insertOne(newAccount);

          // Tạo mới user
          await db.collection('user').insertOne({
            email: user.email,
            username: newAccount.username,
            name: user.name || '',
            image: user.image || '',
            phone: '',
            diachi: '',
            location: { lat: 0, lng: 0 },
            mota: '',
            dientich: 0,
            accountId: accountResult.insertedId,
            donvihtx: '',
            xId: null, // Sẽ cập nhật sau qua form
            masovungtrong: '',
            avatar: '',
            status: false,
            createdAt: new Date(),
          });

          throw new Error('ACCOUNT_PENDING_ACTIVATION');
        }

        if (!existingUser.status) {
          throw new Error('ACCOUNT_PENDING_ACTIVATION');
        }

        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('ACCOUNT_PENDING_ACTIVATION')) {
        return `${baseUrl}/complete-profile`;
      }
      return baseUrl + '/auth';
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username || user.email;
        token.uId = user._id;
        token.xId = user.xId;
        token.status = user.status;
        token.expires = Date.now() + 3 * 24 * 60 * 60 * 1000;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.uId = token.uId;
        session.user.xId = token.xId;
        session.user.status = token.status;
        session.expires = token.expires;
      }
      return session;
    },
  },
};