import { RegisterForm } from "@/feature/auth/components/register-form";
import { requireUnauth } from "@/lib/auth-utils";

const Page = async () => {
  await requireUnauth();
  return (
    <div>
      <RegisterForm />
    </div>
  );
};

export default Page;
