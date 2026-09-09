import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.optimalife.in';

  // Base routes
  const routes = [
    '',
    '/about-us',
    '/contact-us',
    '/products',
    '/careers',
    '/blogs',
    '/optiserve'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch blogs for dynamic routes
  try {
    const snapshot = await adminDb.collection("blog_posts").get();
    const now = new Date();
    
    const blogRoutes = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() } as any))
      .filter((blog: any) => blog.status !== "draft")
      .filter((blog: any) => !blog.scheduledDate || new Date(blog.scheduledDate) <= now)
      .map((blog: any) => ({
        url: `${baseUrl}/blogs/${blog.id}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));

    return [...routes, ...blogRoutes];
  } catch (error) {
    console.error("Error generating sitemap for blogs:", error);
    return routes;
  }
}
