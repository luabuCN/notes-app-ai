"use client";

import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import type { ModelConfig } from "../types/model-config";

interface ModelConfigContextType {
  config: ModelConfig | null;
  isLoading: boolean;
  saveConfig: (config: ModelConfig) => Promise<void>;
  refetch: () => void;
}

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(
  undefined
);

export function useModelConfig() {
  const context = useContext(ModelConfigContext);
  if (!context) {
    throw new Error("useModelConfig must be used within ModelConfigProvider");
  }
  return context;
}

export function ModelConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // 获取模型配置
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ["model-config", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch("/api/ai/model-config");
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch model config");
      }
      return response.json() as Promise<ModelConfig>;
    },
    enabled: !!userId,
  });

  // 保存模型配置
  const saveMutation = useMutation({
    mutationFn: async (newConfig: ModelConfig) => {
      const response = await fetch("/api/ai/model-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConfig),
      });
      if (!response.ok) {
        throw new Error("Failed to save model config");
      }
      return response.json() as Promise<ModelConfig>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["model-config", userId], data);
      queryClient.invalidateQueries({ queryKey: ["model-config"] });
    },
  });

  const saveConfig = async (newConfig: ModelConfig) => {
    await saveMutation.mutateAsync(newConfig);
  };

  return (
    <ModelConfigContext.Provider
      value={{
        config: config || null,
        isLoading,
        saveConfig,
        refetch,
      }}
    >
      {children}
    </ModelConfigContext.Provider>
  );
}

