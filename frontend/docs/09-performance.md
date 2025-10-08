# パフォーマンス最適化

## Next.js App Routerの最適化機能

### 1. Server Components（デフォルト）

Server Componentsはデフォルトでサーバーサイドでレンダリングされ、クライアントバンドルサイズを削減します。

```typescript
// app/products/page.tsx - Server Component
import { getProducts } from '@/external/db/products'
import { ProductList } from '@/features/products/components/ProductList'

export default async function ProductsPage() {
  // サーバーで実行、クライアントにJSは送られない
  const products = await getProducts()
  
  return <ProductList products={products} />
}
```

### 2. Streaming と Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { UserStats, UserStatsSkeleton } from '@/features/users/components/UserStats'
import { RecentActivity, ActivitySkeleton } from '@/features/activity/components/RecentActivity'

export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      {/* 各コンポーネントが独立してストリーミング */}
      <Suspense fallback={<UserStatsSkeleton />}>
        <UserStats />
      </Suspense>
      
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

### 3. Partial Prerendering（実験的機能）

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // Partial Prerenderingを有効化
  },
}

// app/products/[id]/page.tsx
export const dynamic = 'force-static' // 静的な部分
export const revalidate = 3600 // 1時間ごとに再検証

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      {/* 静的にプリレンダリング */}
      <ProductHeader productId={params.id} />
      
      {/* 動的にストリーミング */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>
    </>
  )
}
```

## 画像最適化

### Next.js Image Component

```typescript
// features/products/components/ProductImage.tsx
import Image from 'next/image'

export function ProductImage({ 
  src, 
  alt, 
  priority = false 
}: { 
  src: string
  alt: string
  priority?: boolean
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority} // LCPに影響する画像はpriorityを設定
        className="object-cover"
      />
    </div>
  )
}
```

### 画像の最適化戦略

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/your-bucket/**',
      },
    ],
  },
}
```

## バンドルサイズ最適化

### 動的インポート

```typescript
// features/editor/components/RichTextEditor.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/components/ui/skeleton'

// 重いエディターライブラリを動的インポート
const Editor = dynamic(
  () => import('./Editor').then(mod => mod.Editor),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false, // クライアントのみでレンダリング
  }
)

export function RichTextEditor() {
  return <Editor />
}
```

### Tree Shaking

```typescript
// shared/lib/utils.ts
// 個別エクスポートで未使用コードを除外
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ja-JP').format(date)
}

// 使用側では必要な関数のみインポート
import { cn } from '@/shared/lib/utils'
```

## データフェッチング最適化

### React Queryのキャッシュ戦略

```typescript
// shared/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュの有効期間
      staleTime: 5 * 60 * 1000, // 5分
      
      // メモリ上のキャッシュ保持期間
      gcTime: 10 * 60 * 1000, // 10分
      
      // バックグラウンド再フェッチを無効化
      refetchOnWindowFocus: false,
      
      // 再試行の設定
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})
```

### プリフェッチング

```typescript
// app/products/page.tsx
import { prefetchQuery } from '@/shared/lib/prefetch'

export default async function ProductsPage() {
  // ページ遷移前にデータをプリフェッチ
  await prefetchQuery(['products'], getProducts)
  
  return <ProductList />
}

// features/products/components/ProductCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const handleMouseEnter = () => {
    // ホバー時にプリフェッチ
    queryClient.prefetchQuery({
      queryKey: ['products', product.id],
      queryFn: () => getProduct(product.id),
    })
  }
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* カード内容 */}
    </div>
  )
}
```

## レンダリング最適化

### React.memo と useMemo

```typescript
// features/products/components/ProductFilters.tsx
import { memo, useMemo } from 'react'

interface FilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export const ProductFilters = memo(({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: FilterProps) => {
  // 重い計算結果をメモ化
  const sortedCategories = useMemo(
    () => categories.sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )
  
  return (
    <div>
      {sortedCategories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={selectedCategory === category.id ? 'active' : ''}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return (
    prevProps.selectedCategory === nextProps.selectedCategory &&
    prevProps.categories.length === nextProps.categories.length
  )
})

ProductFilters.displayName = 'ProductFilters'
```

### リスト最適化

```typescript
// features/products/components/VirtualizedProductList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedProductList({ products }: { products: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // 各アイテムの推定高さ
    overscan: 5, // 表示範囲外にレンダリングする数
  })
  
  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProductCard product={products[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Web Vitals 最適化

### Layout Shift 対策

```typescript
// shared/components/ui/skeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      {/* 固定サイズでレイアウトシフトを防ぐ */}
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

### フォント最適化

```typescript
// app/layout.tsx
import { Inter, Noto_Sans_JP } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // FOUTを使用してレンダリングブロックを防ぐ
  variable: '--font-inter',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

## モニタリングとプロファイリング

### Web Vitals測定

```typescript
// app/layout.tsx
import { WebVitalsReporter } from '@/shared/components/WebVitalsReporter'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <WebVitalsReporter />
      </body>
    </html>
  )
}

// shared/components/WebVitalsReporter.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // アナリティクスサービスに送信
    console.log(metric)
  })
  
  return null
}
```

## ベストプラクティス

1. **Server Components優先**: クライアントコンポーネントは必要最小限に
2. **適切なキャッシュ戦略**: データの特性に応じてstaleTimeを設定
3. **遅延読み込み**: 重いコンポーネントは動的インポート
4. **画像の最適化**: Next.js Imageコンポーネントを活用
5. **バンドル分析**: 定期的にバンドルサイズを確認