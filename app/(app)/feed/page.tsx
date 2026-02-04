'use client';

import { useEffect } from "react"
import { X } from 'lucide-react'; // Import the X component

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  ImageIcon,
  Video,
  Bookmark,
  Trash2,
  Link as LinkIcon,
  Repeat2,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MOCK_POSTS, MOCK_USERS } from '@/lib/mock-data';
import { getCurrentUser } from '@/lib/auth';
import { FeedSidebar } from '@/components/feed-sidebar';

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  shares: number;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPosts(MOCK_POSTS);
      const userMap = new Map();
      MOCK_USERS.forEach((user) => {
        userMap.set(user.id, {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          title: user.title,
          company: user.company,
        });
      });
      setUsers(userMap);
      setLoading(false);
    }, 500);
  }, []);

  const getUser = (userId: string): User | undefined => {
    return users.get(userId);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSave = (postId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => prev === postId ? null : postId);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    console.log('[v0] Adding comment to post:', postId, commentText);
    // In a real app, this would update the backend
    setCommentText('');
    setShowComments(null);
  };

  const handleShareToFeed = (post: Post) => {
    setSharingPost(post);
    setShareDialogOpen(true);
  };

  const handleCopyLink = (postId: string) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    console.log('[v0] Copied link:', link);
  };

  const handleShareSubmit = () => {
    if (!shareContent.trim()) return;
    console.log('[v0] Sharing post to feed:', shareContent, sharingPost);
    setShareDialogOpen(false);
    setShareContent('');
    setSharingPost(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Post Composer */}
          <Card className="p-5 shadow-sm border-border/50">
            <div className="flex gap-4">
              <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea 
                  placeholder="Share an update, article, or job opportunity..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="resize-none min-h-[80px] border-0 bg-secondary/30 rounded-xl p-4 focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/70"
                />
                
                {uploadedMedia && (
                  <div className="relative rounded-lg overflow-hidden border border-border/50">
                    <button
                      onClick={() => setUploadedMedia(null)}
                      className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>
                    {uploadedMedia.type === 'image' ? (
                      <img 
                        src={uploadedMedia.url || "/placeholder.svg"} 
                        alt="Upload preview" 
                        className="w-full max-h-80 object-contain bg-secondary/20"
                      />
                    ) : (
                      <video 
                        src={uploadedMedia.url} 
                        controls 
                        className="w-full max-h-80 bg-secondary/20"
                      />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setUploadedMedia({type: 'image', url});
                        }
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2" 
                      title="Add photo"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Photo</span>
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setUploadedMedia({type: 'video', url});
                        }
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2" 
                      title="Add video"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video className="h-5 w-5" />
                      <span className="text-sm font-medium">Video</span>
                    </Button>
                  </div>
                  <Button 
                    disabled={!newPost.trim()} 
                    className="rounded-xl px-6 h-9 font-semibold shadow-sm"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 animate-pulse border-border/50">
                  <div className="flex gap-4">
                    <div className="h-11 w-11 rounded-full bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-muted rounded-lg w-1/3" />
                      <div className="h-3 bg-muted rounded-lg w-1/4" />
                      <div className="h-20 bg-muted rounded-lg w-full mt-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const author = getUser(post.author_id);
                const isLiked = likedPosts.has(post.id);
                const isSaved = savedPosts.has(post.id);
                
                return (
                  <Card key={post.id} className="p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-3">
                        <Avatar className="h-11 w-11 ring-2 ring-border">
                          <AvatarImage src={author?.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {author?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                            {author?.name}
                          </p>
                          <p className="text-sm text-muted-foreground leading-tight">
                            {author?.title} at {author?.company}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.author_id === currentUser?.id && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(post.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete post
                            </DropdownMenuItem>
                          )}
                          {post.author_id !== currentUser?.id && (
                            <DropdownMenuItem className="cursor-pointer">
                              Report post
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Post Image */}
                    {(post as any).image && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-border/50">
                        <img 
                          src={(post as any).image || "/placeholder.svg"} 
                          alt="Post content" 
                          className="w-full h-auto max-h-[500px] object-cover"
                        />
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground py-2 border-y border-border/50">
                      <span className="hover:text-primary cursor-pointer hover:underline">
                        {post.likes + (isLiked ? 1 : 0)} likes
                      </span>
                      <div className="flex gap-4">
                        <span className="hover:text-primary cursor-pointer hover:underline">
                          {post.comments} comments
                        </span>
                        <span className="hover:text-primary cursor-pointer hover:underline">
                          {post.shares} shares
                        </span>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-2 -mx-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleLike(post.id)}
                        className={`flex-1 h-10 rounded-lg gap-2 font-medium transition-colors ${
                          isLiked ? 'text-primary hover:text-primary/80 hover:bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        <ThumbsUp className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
                        <span>Like</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleComments(post.id)}
                        className="flex-1 h-10 rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                      >
                        <MessageCircle className="h-[18px] w-[18px]" />
                        <span>Comment</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 h-10 rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                          >
                            <Share2 className="h-[18px] w-[18px]" />
                            <span>Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem 
                            onClick={() => handleShareToFeed(post)}
                            className="cursor-pointer"
                          >
                            <Repeat2 className="mr-2 h-4 w-4" />
                            Share to feed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCopyLink(post.id)}
                            className="cursor-pointer"
                          >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Copy link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleSave(post.id)}
                        className={`h-10 w-10 rounded-lg transition-colors ${
                          isSaved ? 'text-primary hover:text-primary hover:bg-transparent' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        <Bookmark className={`h-[18px] w-[18px] ${isSaved ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Comment Section */}
                    {showComments === post.id && (
                      <div className="border-t border-border/50 pt-4 space-y-4">
                        {/* Existing comments */}
                        {(post as any).commentsList && (post as any).commentsList.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {(post as any).commentsList.map((comment: any) => {
                              const commentUser = users.get(comment.author_id);
                              return (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={commentUser?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {comment.author_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 bg-secondary/50 rounded-xl p-3">
                                    <p className="font-semibold text-sm text-foreground">{comment.author_name}</p>
                                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {formatTimeAgo(comment.created_at)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Comment input */}
                        <div className="flex gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-border flex-shrink-0">
                            <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {currentUser?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Write a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="resize-none min-h-[60px] text-sm border-0 bg-secondary/30 rounded-xl p-3 focus-visible:ring-1 focus-visible:ring-primary/30"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowComments(null)}
                                className="h-8 px-3"
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentText.trim()}
                                className="h-8 px-4"
                              >
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <FeedSidebar />
        </aside>
      </div>

      {/* Share to Feed Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Share to feed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.title}</p>
              </div>
            </div>
            <Textarea
              placeholder="Add your thoughts..."
              value={shareContent}
              onChange={(e) => setShareContent(e.target.value)}
              className="resize-none min-h-[100px] border-0 bg-secondary/30 rounded-xl p-4 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            {sharingPost && (
              <Card className="p-4 bg-secondary/20 border-border/50">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUser(sharingPost.author_id)?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getUser(sharingPost.author_id)?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{getUser(sharingPost.author_id)?.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{sharingPost.content}</p>
                  </div>
                </div>
              </Card>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShareDialogOpen(false)}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShareSubmit}
                disabled={!shareContent.trim()}
              >
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
