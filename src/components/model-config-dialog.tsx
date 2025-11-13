"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useModelConfig } from "@/lib/provider/model-config-provider";
import type { ModelProvider } from "@/lib/types/model-config";
import { toast } from "sonner";

interface ModelConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelConfigDialog({
  open,
  onOpenChange,
}: ModelConfigDialogProps) {
  const { config, saveConfig, isLoading: configLoading } = useModelConfig();
  const [provider, setProvider] = useState<ModelProvider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activate, setActivate] = useState(true);
  const { data: providerConfig, isFetching: providerFetching } = useQuery({
    queryKey: ["model-config", "provider", provider, open],
    enabled: !!open,
    queryFn: async () => {
      const resp = await fetch(`/api/ai/model-config?provider=${encodeURIComponent(provider)}`);
      if (resp.ok) return resp.json();
      if (resp.status === 404) return null;
      throw new Error("Failed to fetch provider config");
    },
  });

  // 加载已保存的配置
  useEffect(() => {
    if (open) {
      if (config) {
        setProvider(config.provider as ModelProvider);
        setApiKey(config.apiKey);
        setModelName(config.modelName);
        setBaseURL(config.baseURL || "");
        setActivate(true);
      } else {
        // 设置默认值
        setProvider("deepseek");
        setApiKey("");
        setModelName("");
        setBaseURL("");
        setActivate(true);
      }
    }
  }, [open, config]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("请输入 API Key");
      return;
    }
    if (!modelName.trim()) {
      toast.error("请输入模型名称");
      return;
    }

    setIsSaving(true);
    try {
      await saveConfig({
        provider,
        apiKey: apiKey.trim(),
        modelName: modelName.trim(),
        baseURL: baseURL.trim() || undefined,
        activate: activate === true,
      });
      toast.success("模型配置已保存");
      onOpenChange(false);
    } catch (error) {
      toast.error("保存失败，请稍后重试");
      console.error("Failed to save model config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 根据供应商设置默认模型名称
  const getDefaultModelName = (provider: ModelProvider): string => {
    switch (provider) {
      case "openai":
        return "gpt-4o-mini";
      case "gemini":
        return "gemini-2.5-flash";
      case "deepseek":
        return "deepseek-chat";
      case "openrouter":
        return "openai/gpt-oss-20b:free";
      default:
        return "";
    }
  };

  const handleProviderChange = (value: ModelProvider) => {
    setProvider(value);
    // 如果模型名称为空或者是默认值，则更新为新的默认值
    if (!modelName || modelName === getDefaultModelName(provider)) {
      setModelName(getDefaultModelName(value));
    }
  };

  // 当 provider 查询结果返回后回显
  useEffect(() => {
    if (!open) return;
    if (providerFetching) return;
    if (providerConfig) {
      setApiKey(providerConfig.apiKey || "");
      setModelName(providerConfig.modelName || getDefaultModelName(provider));
      setBaseURL(providerConfig.baseURL || "");
      setActivate(providerConfig.isActive ?? false);
    } else if (providerConfig === null) {
      setApiKey("");
      setModelName(getDefaultModelName(provider));
      setBaseURL("");
      setActivate(true);
    }
  }, [providerConfig, providerFetching, open, provider]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>模型配置</DialogTitle>
          <DialogDescription>
            配置 AI 模型的供应商、API Key 和模型名称
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">
              供应商 {providerFetching ? <span className="text-xs text-muted-foreground">（加载中...）</span> : null}
            </Label>
            <Select value={provider} onValueChange={handleProviderChange} disabled={configLoading || isSaving || providerFetching}>
              <SelectTrigger id="provider" className="w-full">
                <SelectValue placeholder="选择供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">
              API Key <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="请输入 API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={configLoading || isSaving || providerFetching}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelName">
              模型名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modelName"
              placeholder={`例如: ${getDefaultModelName(provider)}`}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={configLoading || isSaving || providerFetching}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseURL">请求地址（可选）</Label>
            <Input
              id="baseURL"
              placeholder="留空使用默认地址"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              disabled={configLoading || isSaving || providerFetching}
            />
            <p className="text-xs text-muted-foreground">
              如果不填写，将使用供应商的默认 API 地址
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activate"
              checked={activate}
              onCheckedChange={(v) => setActivate(!!v)}
              disabled={configLoading || isSaving || providerFetching}
            />
            <Label htmlFor="activate" className="cursor-pointer">
              保存后设为当前激活
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving || configLoading}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

