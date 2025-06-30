import ThemeSwitcher from "@/components/shared/header/themeswitcher";

import UserButton from "@/components/shared/header/user-button";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ThemeSwitcher />
        <UserButton />
      </nav>

    </div>
  );
};

export default Menu;
