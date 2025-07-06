import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          别担心，即使是最好的数据有时也会在互联网中迷失。
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回仪表盘
          </Link>
        </div>
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        如果您认为这是一个错误，请联系我们。
      </footer>
    </div>
  );
}
