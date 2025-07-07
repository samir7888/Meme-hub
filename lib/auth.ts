import User from "@/models/User";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import bcrypt from "bcryptjs";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Email and password are required");
        }
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          console.log(user)
          if (!user) {
            throw new Error("User not found");
          }
          const valid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!valid) {
            throw new Error("Invalid  password");
          }
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.log("Authentication error", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id.toString();
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    
  },
  pages:{
    signIn: "/login",
    error: "/login", 
  },
  session:{
    strategy: "jwt",
    maxAge: 24 * 60 * 60 * 30, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
