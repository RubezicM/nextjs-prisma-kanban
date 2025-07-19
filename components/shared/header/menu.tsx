import ThemeSwitcher from "@/components/shared/header/themeswitcher";

import UserButton from "@/components/shared/header/user-button";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden w-full gap-1 md:flex">
        <ThemeSwitcher />
        <UserButton />
      </nav>
    </div>
  );
};

export default Menu;
