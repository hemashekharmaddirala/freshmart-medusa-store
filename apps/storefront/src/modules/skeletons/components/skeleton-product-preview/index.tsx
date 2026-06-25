import { Container } from "@modules/common/components/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse rounded-rounded border border-[#dce8d5] bg-white p-3">
      <Container className="aspect-[4/5] w-full rounded-rounded bg-[#eef5e9]" />
      <div className="mt-4 space-y-3">
        <div className="h-5 w-3/4 rounded-rounded bg-[#eef5e9]" />
        <div className="h-4 w-1/2 rounded-rounded bg-[#eef5e9]" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-1/3 rounded-rounded bg-[#eef5e9]" />
          <div className="h-9 w-14 rounded-rounded bg-[#dce8d5]" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
