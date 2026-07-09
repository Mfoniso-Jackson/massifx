import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "massifx-local-demo-secret-do-not-use-in-production",
  pages: { signIn: "/dashboard" },
  providers: [
    CredentialsProvider({
      name: "Demo credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = process.env.DEMO_USER_EMAIL ?? "demo@massifx.ai";
        const password = process.env.DEMO_USER_PASSWORD ?? "massifx-demo-password";
        if (credentials?.email === email && credentials.password === password) {
          return { id: "demo-user", email, name: "MassifX Demo Operator" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) session.user.name = token.name ?? "MassifX Demo Operator";
      return session;
    }
  }
});

export { handler as GET, handler as POST };
