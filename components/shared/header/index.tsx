import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

import Menu from "@/components/shared/header/menu";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            {/*<Image*/}
            {/*  src="/images/globe.svg"*/}
            {/*  alt={`${APP_NAME} logo`}*/}
            {/*  width={48}*/}
            {/*  height={48}*/}
            {/*  priority={true}*/}
            {/*/>*/}
            <span className="ml-3 hidden text-2xl font-bold lg:block">{APP_NAME}</span>
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
