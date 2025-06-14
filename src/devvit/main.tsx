import { Devvit, Post, useWebView, useState } from "@devvit/public-api";
import type { DevvitMessage, WebViewMessage } from 'message';

import "../server/index";
import { defineConfig } from "@devvit/server";

defineConfig({
    name: "Cats can balance",
    //entry: "index.html",
    //height: "tall",
    menu: { enable: false },
});

export const Preview: Devvit.BlockComponent<{ text?: string }> = ({
    text = "Loading...",
}) => {
    return (
        <zstack width={"100%"} height={"100%"} alignment="center middle">
            <vstack width={"100%"} height={"100%"} alignment="center middle">
                <image
                    url="loading.gif"
                    description="Loading..."
                    height={"140px"}
                    width={"140px"}
                    imageHeight={"240px"}
                    imageWidth={"240px"}
                />
                <spacer size="small" />
                <text
                    maxWidth={`80%`}
                    size="large"
                    weight="bold"
                    alignment="center middle"
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
    label: "[Cats]: New Game",
    location: "subreddit",
    forUserType: "moderator",
    onPress: async (_event, context) => {
        const { reddit, ui } = context;

        let post: Post | undefined;
        try {
            const subreddit = await reddit.getCurrentSubreddit();
            post = await reddit.submitPost({
                // Title of the post. You'll want to update!
                title: "Cats can balance !",
                subredditName: subreddit.name,
                preview: <Preview />,
            });
            ui.showToast({ text: "Created post!" });
            ui.navigateTo(post.url);
        } catch (error) {
            if (post) {
                await post.remove(false);
            }
            if (error instanceof Error) {
                ui.showToast({ text: `Error creating post: ${error.message}` });
            } else {
                ui.showToast({ text: "Error creating post!" });
            }
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
      const userId = await context.reddit.getCurrentUsername();
      const hashKey = "scores";
      
      const currentScore = await context.redis.zScore(userId, hashKey);
      return Number(currentScore ?? 0);
    });
    
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'index.html',
      async onMessage(message, webView) {
        switch (message.type) {
          case 'setScore':
            const userId = await context.reddit.getCurrentUsername();
            const hashKey = "scores";
            
            const oldScoreStr = await context.redis.hGet(hashKey, userId);
            const oldScore = Number(oldScoreStr ?? 0);
            const newScore = Number(message.data.newScore);
            
            if (!oldScore || newScore > oldScore) {
              await context.redis.hSet(hashKey, userId, newScore.toString());
              setScore(newScore);
            }
      
            break;
        }
      },
    });

    return (
      <vstack grow padding="small">
        <vstack grow alignment="middle center">
          <text weight="bold">
            Highscore: { score ?? '0' }
          </text>
          <button onPress={() => webView.mount()}>Start App</button>
        </vstack>
      </vstack>
    );
  },
});


export default Devvit;
