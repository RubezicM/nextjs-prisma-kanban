import { auth } from "@/auth";

const DashboardPage = async () => {
    const session = await auth()
  return (
    <div>Welcome back, {session?.user?.name}!</div>
  );
};

export default DashboardPage;
