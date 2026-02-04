// lib/posts.ts
// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// ✅ DEFINICIÓN DEL TIPO DE POST
interface Post {
  slug: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  
  // ✅ Mapeo con tipo explícito
  const allPostsData: Post[] = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // ✅ Aseguramos que los datos tengan la estructura correcta
    return {
      slug,
      createdAt: data.createdAt || '1970-01-01',
      title: data.title || 'Título no disponible',
      excerpt: data.excerpt || 'Sin resumen',
      content,
    };
  });

  // ✅ Ordenar por fecha descendente
  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

export function getLatestPost(): Post | null {
  const allPosts = getSortedPostsData();
  return allPosts[0] || null;
}