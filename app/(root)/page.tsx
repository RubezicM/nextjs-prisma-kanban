import { auth } from "@/auth"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
    const session = await auth()

    return (
        <div className="">
            {!session && <div className="flex flex-col justify-center space-y-4">
              <h3>Please sign in to use this app.</h3>
            </div>}
            {session && (
                <>
                    <h2 className="text-2xl font-bold mb-4">
                        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
                    </h2>
                    <p className="text-lg">Go to your <Button asChild
                                                              variant="link"
                                                              className="p-0 text-lg">
                        <Link href="/dashboard"
                              className="underline">dashboard</Link></Button></p>
                </>
            )}
        </div>
    )
}
