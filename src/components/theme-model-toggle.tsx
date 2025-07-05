"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeViewTransitionProps = {
  event: React.MouseEvent;
  nextTheme: "light" | "dark" | "system";
};

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();

  const calculateClipPath = (x: number, y: number) => {
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );
    return [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];
  };

  const toggleThemeWithTransition = React.useCallback(
    ({ event, nextTheme }: ThemeViewTransitionProps) => {
      if (!document.startViewTransition) {
        setTheme(nextTheme);
        return;
      }

      const { clientX, clientY } = event;
      const clipPath = calculateClipPath(clientX, clientY);

      document.startViewTransition(() => {
        setTheme(nextTheme);
      }).ready.then(() => {
        const isDarkAfter =
          nextTheme === "dark" ||
          (nextTheme === "system" && systemTheme === "dark");

        document.documentElement.animate(
          {
            clipPath: isDarkAfter ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 650,
            easing: "ease-in",
            pseudoElement: isDarkAfter
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          }
        );
      });
    },
    [setTheme, systemTheme]
  );

  const handleThemeToggle = React.useCallback(
    (event: React.MouseEvent, nextTheme: "light" | "dark" | "system") => {
      if (theme === nextTheme) return;

      if (nextTheme === "system") {
        if (theme !== systemTheme) {
          toggleThemeWithTransition({
            event,
            nextTheme,
          });
        } else {
          setTheme("system");
        }
      } else {
        toggleThemeWithTransition({
          event,
          nextTheme,
        });
      }
    },
    [theme, systemTheme, toggleThemeWithTransition]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-full cursor-pointer">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => handleThemeToggle(e, "light")}>
          明亮
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeToggle(e, "dark")}>
          暗黑
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeToggle(e, "system")}>
          系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
