import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: { type: "password" } },
      async authorize(raw) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        // MVP bootstrap admin: one configured account. Add invitation-based users before multi-user rollout.
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) return null;
        if (email !== process.env.ADMIN_EMAIL.toLowerCase()) return null;
        const ok = await bcrypt.compare(parsed.data.password, process.env.ADMIN_PASSWORD_HASH);
        return ok ? { id: "bootstrap-admin", email, name: "Admin" } : null;
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth }) => !!auth?.user,
    jwt: async ({ token, user }) => { if (user) token.uid = user.id; return token; },
    session: async ({ session, token }) => {
      if (session.user) (session.user as typeof session.user & { id?: string }).id = String(token.uid ?? "");
      return session;
    }
  }
});
