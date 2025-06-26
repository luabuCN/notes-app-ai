"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

// 定义表单验证schema
const signUpSchema = z
  .object({
    name: z.string().min(1, "名字不能为空"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z.string().min(6, "密码至少需要6个字符"),
    passwordConfirmation: z.string().min(6, "确认密码至少需要6个字符"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "两次输入的密码不一致",
    path: ["passwordConfirmation"],
  });

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async () => {
    try {
      // 验证表单数据
      const validatedData = signUpSchema.parse({
        name,
        email,
        password,
        passwordConfirmation,
      });

      await signUp.email({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        image: image ? await convertImageToBase64(image) : "",
        callbackURL: "/signin",
        fetchOptions: {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            setLoading(true);
          },
          onError: (ctx) => {
            toast({
              variant: "destructive",
              description: ctx.error.message,
            });
          },
          onSuccess: async () => {
            router.push("/signin");
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 显示第一个验证错误
        toast({
          variant: "destructive",
          description: error.errors[0].message,
        });
      }
    }
  };

  return (
    <Card className="z-50 rounded-md rounded-t-none w-[450px]">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">注册</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          输入您的信息以创建账户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid  gap-2">
            <Label htmlFor="name">名字</Label>
            <Input
              id="name"
              placeholder="小明"
              required
              onChange={(e) => {
                setName(e.target.value);
              }}
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              required
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="请输入密码"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">确认密码</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="请再次输入密码"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">头像（可选）</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="头像预览"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="text-center text-sm">
            已经有账号？{" "}
            <Link className="underline underline-offset-4" href="/signin">
              登录
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={handleSignUp}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "创建账户"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
