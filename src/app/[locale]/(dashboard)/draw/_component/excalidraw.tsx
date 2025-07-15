"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "@excalidraw/excalidraw/index.css";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Fullscreen } from "lucide-react";
import { AiDialog } from "./ai-dialog";

const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
    })),
  { ssr: false }
);
const WelcomeScreen = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.WelcomeScreen),
  { ssr: false }
);

export function ExcalidrawComponent() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const locale = useLocale();
  const { resolvedTheme } = useTheme();

  

  return (
    <div className="h-full w-full relative">
      <Excalidraw
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
        onChange={(elements, appState, files) => {}}
        langCode={locale === "zh" ? "zh-CN" : "en"}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        initialData={{
          appState: {
            currentItemFontFamily: 1,
          },
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: {
              saveFileToDisk: true,
            },
            clearCanvas: true,
          },
          tools: {
            image: true,
          },
        }}
        renderTopRightUI={() => {
          return <AiDialog excalidrawAPI={excalidrawAPI!}/>;
        }}
      >
        <WelcomeScreen/>
      </Excalidraw>
    </div>
  );
}