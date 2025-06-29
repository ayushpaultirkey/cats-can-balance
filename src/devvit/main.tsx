import { Devvit, Post, useWebView, useState } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage } from 'message';

import '../server/index';
import { defineConfig } from '@devvit/server';

defineConfig({
    name: 'Cats can balance',
    //entry: 'index.html',
    //height: 'tall',
    menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({
    text = 'Loading...',
}) => {
    return (
        <zstack width={'100%'} height={'100%'} alignment='center middle'>
            <vstack width={'100%'} height={'100%'} alignment='center middle'>
                <image
                    url='cat-idle.gif'
                    description='Loading...'
                    height={'140px'}
                    width={'140px'}
                    imageHeight={'240px'}
                    imageWidth={'240px'}
                />
                <spacer size='small' />
                <text
                    maxWidth={`80%`}
                    size='large'
                    weight='bold'
                    alignment='center middle'
                    wrap
                >
                    {text}
                </text>
            </vstack>
        </zstack>
    );
};

// TODO: Remove this when defineConfig allows webhooks before post creation
Devvit.addMenuItem({
    // Please update as you work on your idea!
    label: '[Cats]: New Game',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (_event, context) => {
        const { reddit, ui } = context;

        let post: Post | undefined;
        try {
            const subreddit = await reddit.getCurrentSubreddit();
            post = await reddit.submitPost({
                // Title of the post. You'll want to update!
                title: 'Cats can balance !',
                subredditName: subreddit.name,
                preview: <Preview />,
            });
            ui.showToast({ text: 'Post created!' });
            ui.navigateTo(post.url);
        } catch (error) {
            if (post) {
                await post.remove(false);
            }
            if (error instanceof Error) {
                ui.showToast({ text: `Error creating post: ${error.message}` });
            } else {
                ui.showToast({ text: 'Error creating post!' });
            }
        }
    },
});

// TODO: Remove this when defineConfig allows webhooks before post creation
Devvit.addMenuItem({
    // Please update as you work on your idea!
    label: '[Cats]: Reset Game',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (_event, context) => {
        const { redis, ui } = context;
        try {
            const scoreKeys = await redis.hKeys('score');
            await redis.hDel('score', scoreKeys);
            ui.showToast({ text: 'Score reset!' });
        } catch (error) {
            console.log(error);
            ui.showToast({ text: 'Error while reseting scores!' });
        }
    },
});

Devvit.addCustomPostType({
  name: 'Cats Post',
  height: 'tall',
  render: (context) => {
    
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });
    
    const [score, setScore] = useState(async () => {
      const currentScore = await context.redis.hGet('score', username);
      return Number(currentScore ?? 0);
    });

    const [highscores, setHighscores] = useState(async () => {
      const scores = await context.redis.hGetAll('score');
      const entries = Object.entries(scores).map(([user, score]) => ({
        user,
        score: Number(score),
      }));
      entries.sort((a, b) => b.score - a.score);
      return entries.slice(0, 5);
    });
    
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'index.html',
      async onMessage(message, webView) {
        
        switch (message.type) {
          case 'setScore':
            const oldScoreStr = await context.redis.hGet('score', username);
            const newScore = Number(message.data.newScore ?? 0);
            const oldScore = Number(oldScoreStr ?? 0);
            
            if (!oldScore || newScore > oldScore) {
              const data = {};
              data[username] = newScore.toString();
              
              await context.redis.hSet('score', data);
              setScore(newScore);
            }
            break;
          case 'boltNavigate':
            const url = 'https://bolt.new/';
            context.ui.navigateTo(url);
            break;
        }
        
      },
    });

    return (
      <zstack grow alignment='middle center' padding='small'>
        <vstack grow alignment='middle' gap='small'>
          <vstack alignment='middle center'>
            <image url='cat-idle.gif' imageWidth={64} imageHeight={64} />
            <text size='xxlarge' style='heading'>Leaderboard</text>
          </vstack>
          <vstack border='thin' borderColor='#444444' cornerRadius='small'></vstack>
          <vstack alignment='center'>
            {
              highscores.map((entry, index) => (
                <hstack gap='small'>
                  <text size='small'>{index + 1}.</text>
                  <text size='small'>u/{entry.user}:</text>
                  <text size='small' weight='bold'>{entry.score}</text>
                </hstack>
              ))
            }
          </vstack>
          <vstack border='thin' borderColor='#444444' cornerRadius='small'></vstack>
          <hstack alignment='center' gap='small'>
            <text>Your Score:</text>
            <text weight='bold'>{score}</text>
          </hstack>
          <hstack alignment='middle center' gap='small'>
            <button onPress={() => webView.mount()}>Start App</button>
            <button appearance='destructive' onPress={
              async () => {
                const { redis, ui } = context;
                try {
                    await redis.hDel('score', [username]);
                    setScore(0);
                    ui.showToast({ text: 'Score reset!' });
                } catch (error) {
                    console.log(error);
                    ui.showToast({ text: 'Error while reseting scores!' });
                }
              }
            }>Reset Score</button>
          </hstack>
        </vstack>
        <vstack alignment='top end' width='100%' height='100%' border='thick' lightBorderColor="#444444" darkBorderColor="#ff8905" cornerRadius='small'>
          <image url='bolt.png' imageWidth={86} imageHeight={86} onPress={
            () => {
              const url = 'https://bolt.new/';
              context.ui.navigateTo(url);
            }} />
        </vstack>
      </zstack>
    );
  },
});


export default Devvit;
