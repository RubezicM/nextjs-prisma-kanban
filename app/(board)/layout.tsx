import Menu from "@/components/shared/header/menu";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="bg-background border-b">
        <div className="flex items-center justify-between px-6 py-2">
          {/*Here it would come board switcher/options */}
          <div>kurac</div>

          {/* Here user menu/ theme switcher */}
          <Menu />
        </div>
      </div>

      {/* Board content - full width, no container */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
