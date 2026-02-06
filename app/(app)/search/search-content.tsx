'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Briefcase } from 'lucide-react';

interface SearchResult {
  people: any[];
  posts: any[];
  jobs: any[];
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult>({
    people: [],
    posts: [],
    jobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const mockPeople = [
          {
            id: '1',
            name: 'Sarah Johnson',
            title: 'Product Manager',
            company: 'Tech Corp',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            bio: 'Passionate about building great products',
            location: 'San Francisco, CA',
          },
          {
            id: '2',
            name: 'Sam Chen',
            title: 'Software Engineer',
            company: 'StartUp Inc',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
            bio: 'Full stack developer',
            location: 'New York, NY',
          },
        ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

        const mockPosts = [
          {
            id: '1',
            title: 'Just landed my dream role!',
            author: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            excerpt: 'Excited to announce that I have accepted a position as a Senior Engineer...',
            likes: 234,
            comments: 45,
          },
          {
            id: '2',
            title: 'Sharing insights on remote work',
            author: 'Jane Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
            excerpt: 'After 2 years of working remotely, here are my top tips for staying productive...',
            likes: 567,
            comments: 89,
          },
        ].filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase()));

        const mockJobs = [
          {
            id: '1',
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            salary: '$150k - $200k',
            level: 'Senior',
          },
          {
            id: '2',
            title: 'Product Manager',
            company: 'StartUp Inc',
            location: 'Remote',
            salary: '$120k - $160k',
            level: 'Mid-level',
          },
          {
            id: '3',
            title: 'UX Designer',
            company: 'Design Studio',
            location: 'New York, NY',
            salary: '$100k - $140k',
            level: 'Mid-level',
          },
        ].filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.company.toLowerCase().includes(query.toLowerCase()));

        setResults({
          people: mockPeople,
          posts: mockPosts,
          jobs: mockJobs,
        });
      } catch (error) {
        console.error('[v0] Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const totalResults = results.people.length + results.posts.length + results.jobs.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Search results for "{query}"
        </h1>
        <p className="text-muted-foreground">Showing results across all categories</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-0 bg-transparent border-b border-border p-0 mb-6">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-4 py-3 font-medium"
          >
            <span className="flex items-center gap-2">
              All
            </span>
            <Badge variant="secondary" className="ml-2">{totalResults}</Badge>
          </TabsTrigger>
          
          <TabsTrigger
            value="people"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-4 py-3 font-medium"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              People
            </span>
            <Badge variant="secondary" className="ml-2">{results.people.length}</Badge>
          </TabsTrigger>

          <TabsTrigger
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-4 py-3 font-medium"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </span>
            <Badge variant="secondary" className="ml-2">{results.posts.length}</Badge>
          </TabsTrigger>

          <TabsTrigger
            value="jobs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-4 py-3 font-medium"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </span>
            <Badge variant="secondary" className="ml-2">{results.jobs.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {totalResults === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {results.people.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    People
                  </h3>
                  <div className="space-y-2 mb-6">
                    {results.people.map((person) => (
                      <Link key={person.id} href={`/users/${person.id}`}>
                        <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={person.avatar} />
                              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{person.name}</p>
                              <p className="text-sm text-muted-foreground">{person.title} at {person.company}</p>
                              <p className="text-xs text-muted-foreground mt-1">{person.location}</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Posts
                  </h3>
                  <div className="space-y-2 mb-6">
                    {results.posts.map((post) => (
                      <Link key={post.id} href={`/posts/${post.id}`}>
                        <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={post.avatar} />
                              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{post.title}</p>
                              <p className="text-sm text-muted-foreground">{post.author}</p>
                              <p className="text-sm text-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{post.likes} likes</span>
                                <span>{post.comments} comments</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Jobs
                  </h3>
                  <div className="space-y-2">
                    {results.jobs.map((job) => (
                      <Card key={job.id} className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
                            <p className="text-sm font-medium text-primary mt-2">{job.salary}</p>
                          </div>
                          <Badge variant="outline">{job.level}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-2">
          {results.people.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No people found for "{query}"</p>
            </div>
          ) : (
            results.people.map((person) => (
              <Link key={person.id} href={`/users/${person.id}`}>
                <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.title} at {person.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">{person.location}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-2">
          {results.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found for "{query}"</p>
            </div>
          ) : (
            results.posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{post.title}</p>
                      <p className="text-sm text-muted-foreground">{post.author}</p>
                      <p className="text-sm text-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-2">
          {results.jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found for "{query}"</p>
            </div>
          ) : (
            results.jobs.map((job) => (
              <Card key={job.id} className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
                    <p className="text-sm font-medium text-primary mt-2">{job.salary}</p>
                  </div>
                  <Badge variant="outline">{job.level}</Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
