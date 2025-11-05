import { AnimatePresence, motion } from "motion/react"
import { FileItem } from "./file-items"
import { FileAttachment } from "./types"
import { useRef, useMemo } from "react"

type FileListProps = {
  files: FileAttachment[]
  onFileRemove: (file: File) => void
}

export function FileList({ files, onFileRemove }: FileListProps) {
  const hasShownRef = useRef(false)
  const previousFilesRef = useRef<Set<string>>(new Set())

  // 生成稳定的key，基于文件名和大小
  const fileKeys = useMemo(() => {
    return files.map((fileAttachment) => {
      const key = `${fileAttachment.file.name}-${fileAttachment.file.size}`
      return { fileAttachment, key }
    })
  }, [files])

  // 标记容器是否已经显示过
  const shouldAnimateContainer = !hasShownRef.current && files.length > 0
  if (files.length > 0 && !hasShownRef.current) {
    hasShownRef.current = true
  }

  // 计算新文件
  const newFileKeys = useMemo(() => {
    const currentFileKeys = new Set(fileKeys.map(({ key }) => key))
    const newKeys = new Set(
      fileKeys
        .filter(({ key }) => !previousFilesRef.current.has(key))
        .map(({ key }) => key)
    )
    previousFilesRef.current = currentFileKeys
    return newKeys
  }, [fileKeys])

  return (
    <AnimatePresence initial={false}>
      {files.length > 0 && (
        <motion.div
          key="files-list"
          initial={shouldAnimateContainer ? { height: 0, opacity: 0 } : false}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-row overflow-x-auto pl-3">
            <AnimatePresence initial={false} mode="popLayout">
              {fileKeys.map(({ fileAttachment, key }) => {
                const isNewFile = newFileKeys.has(key)
                
                return (
                  <motion.div
                    key={key}
                    initial={isNewFile ? { opacity: 0, scale: 0.8 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    layout
                    className="relative shrink-0 w-[180px] overflow-hidden pt-2"
                  >
                    <FileItem
                      file={fileAttachment.file}
                      uploading={fileAttachment.uploading}
                      onRemove={onFileRemove}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
