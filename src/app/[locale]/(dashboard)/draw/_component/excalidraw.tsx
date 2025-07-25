"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import "@excalidraw/excalidraw/index.css";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { isEqual, throttle } from "lodash";
import { AiDialog } from "./ai-dialog";
import { useDrawStore } from "./store";
import { getDrawDetail } from "../_action/get-draw-detail";
import { toast } from "sonner";
import router from "next/router";
import { saveDrawData } from "../_action/use-save-draw";
import SaveIndicator from "./save-indicator";

interface ExcalidrawComponentProps {
  drawId: string;
}

const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => ({
      default: mod.Excalidraw,
    })),
  { ssr: false }
);

const WelcomeScreen = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.WelcomeScreen),
  { ssr: false }
);

export function ExcalidrawComponent({ drawId }: ExcalidrawComponentProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const { setCurrentDraw, currentDraw } = useDrawStore();
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "unsaved">("saved");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    if (isInit) return;
    if (excalidrawAPI && currentDraw?.data) {
      excalidrawAPI.updateScene(currentDraw.data as any);
      setIsInit(true);
      setSaveStatus('saved');
    }
  }, [excalidrawAPI, currentDraw?.data]);

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        let drawDetail = await getDrawDetail(drawId);
        if (!drawDetail) {
          toast.error("未找到内容");
          router.push(`${locale}/draw`);
          return;
        }

        if ((drawDetail?.data as any)?.appState?.collaborators &&
          !((drawDetail.data as any).appState.collaborators instanceof Map)) {
          (drawDetail.data as any).appState.collaborators = new Map(
            Object.entries((drawDetail.data as any).appState.collaborators)
          );
        }

        setCurrentDraw(drawDetail);
        setSaveStatus("saved");
      } catch {
        toast.error("获取内容失败，请稍后重试");
      }
    };

    fetchAndSetData();
  }, [drawId]);

  const throttledSaveRef = useRef(
    throttle(async (elements, appState, files) => {
      try {
        setSaveStatus("saving");
        await saveDrawData({
          id: drawId,
          data: { elements, appState, files },
        });
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("unsaved");
      }
    }, 10000, { leading: false, trailing: true })
  );

  useEffect(() => {
    return () => {
      throttledSaveRef.current.cancel();
    };
  }, []);

  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      if (!currentDraw) return;

      const prevData = currentDraw.data;
      if (!prevData) return;

      const isElementsChanged = !isEqual(elements, prevData.elements);
      const isAppStateChanged = !isEqual(appState, prevData.appState);
      const isFilesChanged = !isEqual(files, prevData.files);

      if (isElementsChanged || isAppStateChanged || isFilesChanged) {
        setSaveStatus("unsaved");

        setCurrentDraw({
          ...currentDraw,
          data: {
            elements,
            appState,
            files,
          },
        });

        throttledSaveRef.current(elements, appState, files);
      }
    },
    [currentDraw, setCurrentDraw]
  );

  return (
    <div className="h-full w-full relative">
      <Excalidraw
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
        onChange={handleChange}
        langCode={locale === "zh" ? "zh-CN" : "en"}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        initialData={currentDraw?.data}
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
          return (
            <>
              <SaveIndicator status={saveStatus} />
              <AiDialog excalidrawAPI={excalidrawAPI!} />
            </>
          );
        }}
      >
        <WelcomeScreen />
      </Excalidraw>
    </div>
  );
}