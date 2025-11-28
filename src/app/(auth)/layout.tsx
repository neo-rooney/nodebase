import AuthLayout from "@/feature/auth/components/auth-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
