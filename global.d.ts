// Ambient asset declarations so `tsc --noEmit` passes in CI, where Next.js
// has not generated `next-env.d.ts` (it is gitignored). Mirrors the `*.png`
// declaration from `next/image-types/global`.
declare module '*.png' {
  const content: import('next/image').StaticImageData
  export default content
}
