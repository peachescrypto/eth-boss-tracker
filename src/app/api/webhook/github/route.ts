import { NextRequest, NextResponse } from 'next/server';
import { generateTweet, postToTwitter } from '@/lib/developer-updates';

interface GitHubPushPayload {
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      username?: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  head_commit: {
    id: string;
    message: string;
    url: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: GitHubPushPayload = await request.json();
    
    // Only process pushes to main branch
    if (payload.ref !== 'refs/heads/main') {
      return NextResponse.json({ message: 'Not main branch, skipping' });
    }

    // Extract commit info
    const commit = payload.head_commit;
    const commitCount = payload.commits.length;
    
    // Collect file changes for context
    const fileChanges = payload.commits.flatMap(c => [
      ...c.added.map(f => `add:${f}`),
      ...c.modified.map(f => `mod:${f}`),
      ...c.removed.map(f => `del:${f}`)
    ]);
    
    // Generate tweet content
    const tweetContent = generateTweet(commit.message, commitCount, fileChanges);
    
    // Post to Twitter
    const tweetResult = await postToTwitter(tweetContent);
    
    return NextResponse.json({ 
      success: tweetResult.success, 
      tweet: tweetContent,
      tweetId: tweetResult.tweetId,
      error: tweetResult.error
    });
    
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 });
  }
}


