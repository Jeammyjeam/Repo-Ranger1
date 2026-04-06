"use client";

import Link from "next/link";
import { Logo } from "@/components/icons";
// import ThemeSwitcher from '@/components/ThemeSwitcher';
// import { AuthButton } from './auth-button';
import {
  Flame,
  Package,
  Library,
  Bot,
  Menu,
  Shuffle,
  Loader2,
  Settings,
  Bookmark,
} from "lucide-react";
import { RandomRepoButton } from "./random-repo-button";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getRandomRepository } from "@/lib/discovery";
import { useUser } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

const MobileRandomRepoButton = ({ onNavigate }: { onNavigate: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const repo = await getRandomRepository();
      if (repo) {
        router.push(`/repo/${repo.owner}/${repo.repo}`);
        onNavigate();
      } else {
        toast({ variant: "destructive", title: "Could not find a repository" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "An error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex w-full items-center gap-2 rounded-md p-2 text-base font-medium text-foreground hover:bg-accent disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Shuffle className="h-5 w-5" />
      )}
      Random
    </button>
  );
};

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const logoHref = user ? "/search" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex items-center">
          <Link href={logoHref} className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold sm:inline-block">Repo Ranger</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
          <Link
            href="/trending"
            className="flex items-center gap-1 transition-colors text-muted-foreground hover:text-foreground/80"
          >
            <Flame className="h-4 w-4" /> Trending
          </Link>
          <Link
            href="/collections"
            className="flex items-center gap-1 transition-colors text-muted-foreground hover:text-foreground/80"
          >
            <Bookmark className="h-4 w-4" /> Saved
          </Link>
          <Link
            href="/archives"
            className="flex items-center gap-1 transition-colors text-muted-foreground hover:text-foreground/80"
          >
            <Package className="h-4 w-4" /> Archives
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1 transition-colors text-muted-foreground hover:text-foreground/80"
          >
            <Bot className="h-4 w-4" /> AI Chat
          </Link>
          <Link
            href="/ai"
            className="flex items-center gap-1 transition-colors text-muted-foreground hover:text-foreground/80"
          >
            <Bot className="h-4 w-4" /> Custom AI
          </Link>
          <RandomRepoButton />
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-full flex-col sm:max-w-xs p-0"
            >
              <div className="p-6 border-b">
                <Link
                  href={logoHref}
                  className="flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Logo className="h-6 w-6 mr-2" />
                  <span className="font-bold">Repo Ranger</span>
                </Link>
              </div>
              <ScrollArea className="flex-1">
                <nav className="grid gap-2 p-6 text-base font-medium">
                  <Link
                    href="/trending"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Flame className="h-5 w-5" /> Trending
                  </Link>
                  <Link
                    href="/collections"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bookmark className="h-5 w-5" /> Saved Repos
                  </Link>
                  <Link
                    href="/archives"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-5 w-5" /> Archives
                  </Link>
                  <Link
                    href="/chat"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bot className="h-5 w-5" /> AI Chat
                  </Link>
                  <Link
                    href="/ai"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bot className="h-5 w-5" /> Custom AI
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md p-2 text-foreground hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" /> Settings
                  </Link>
                  <MobileRandomRepoButton
                    onNavigate={() => setIsMobileMenuOpen(false)}
                  />
                </nav>
              </ScrollArea>
              <div className="mt-auto border-t p-6">
                <div className="flex items-center justify-between">
                  {/* <AuthButton /> */}
                  {/* <ThemeSwitcher /> */}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end space-x-2">
          <Link
            href={logoHref}
            className="flex items-center space-x-2 md:hidden"
          >
            <Logo className="h-6 w-6" />
            <span className="font-bold">Repo Ranger</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {/* <AuthButton /> */}
            {/* <ThemeSwitcher /> */}
          </div>
        </div>
      </div>
    </header>
  );
}
