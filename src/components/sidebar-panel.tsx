import {
  DraggablePanel,
  DraggablePanelBody,
  DraggablePanelContainer,
  DraggablePanelHeader,
} from "@lobehub/ui";
import { useEffect, useState } from "react";
import { Flexbox } from "react-layout-kit";
import { ThemeProvider } from "@lobehub/ui";
import { useTheme } from "next-themes";
export function SidebatPanel({
  minWidth = 150,
  maxWidth = 300,
  children,
}: {
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [expand, setExpand] = useState(true);
  const [pin, setPin] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <ThemeProvider themeMode={ theme === 'light' ? 'light' : theme === 'dark' ? 'dark' : 'auto'} className="w-auto!">
      <Flexbox horizontal className="h-screen relative">
        <DraggablePanel
          expand={expand}
          mode={pin ? "fixed" : "float"}
          onExpandChange={setExpand}
          pin={pin}
          placement="left"
          className="flex flex-col"
          minWidth={minWidth}
          maxWidth={maxWidth}
        >
          <DraggablePanelContainer className="flex-1">
            <DraggablePanelHeader
              pin={pin}
              position="left"
              setExpand={setExpand}
              setPin={setPin}
            />
            <DraggablePanelBody>{children}</DraggablePanelBody>
          </DraggablePanelContainer>
        </DraggablePanel>
      </Flexbox>
    </ThemeProvider>
  );
}
