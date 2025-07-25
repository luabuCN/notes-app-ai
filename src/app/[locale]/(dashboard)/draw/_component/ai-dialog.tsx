import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2, Send, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMutation } from "@tanstack/react-query"
import { generateDrawing } from "../_action/generateDrawing"
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import { toast } from "sonner"

export function AiDialog({ excalidrawAPI }: { excalidrawAPI: ExcalidrawImperativeAPI }) {
  const [prompt, setPrompt] = useState("")
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: async () => await generateDrawing(prompt),
    onSuccess: (jsonData) => {
      console.log(jsonData);

      let drawData = jsonData
      if (drawData.appState?.collaborators &&
        !(drawData.appState.collaborators instanceof Map)) {
        drawData.appState.collaborators = new Map(
          Object.entries((drawData as any).appState.collaborators)
        );
      }
      excalidrawAPI.updateScene({
        elements: drawData.elements,
        appState: {
          ...drawData.appState,
          isLoading: false,
        },
      });
      setPrompt("");
      toast.success("生成成功");
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    mutate()
  }

  const examplePrompts = [
    "画一个简单的流程图",
    "设计一个网站架构图",
    "创建一个思维导图",
    "绘制一个用户界面原型"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI 生成草图
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI 草图生成器
          </DialogTitle>
          <DialogDescription>
            描述你想要的图表或草图，AI 将为你在 Excalidraw 中生成相应的内容。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              描述你的想法
            </Label>
            <Textarea
              id="prompt"
              placeholder="例如：画一个包含用户登录、数据处理和结果展示的系统流程图..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              快速示例
            </Label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                生成草图
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}