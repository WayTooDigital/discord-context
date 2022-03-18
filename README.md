# Discord Context

## React / NextJs

This package should be used on React / NextJS projects that requires an integration with Discord. The idea is to simplify the "Login with Discord" functionality.

## Installation

1. Install the package in your ongoing project
   ```bash
   $ yarn install https://github.com/emi-wtd/discord-context
   ```
   Now you will see that your `package.json` file has a new record:
   ```json
   "discord-context": "https://github.com/emi-wtd/discord-context"
   ```
2. You have to wrap your app with a provider called `<DiscordProvider />`.

   As example in a NextJs project, open the `_app.js` file (located by default on `pages` folder), then you have to wrap `<Component {...pageProps} />` with `<DiscordProvider />`.

   ```js
   import { DiscordProvider } from "discord-context";

   function MyApp({ Component, pageProps }) {
     <DiscordProvider
       redirectUri="{process.env.NEXT_PUBLIC_FRONT_URL}"
       discordClientId="{process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}"
       discordClientSecret="{process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET}"
     >
       <Component {...pageProps} />
     </DiscordProvider>
   }
   
   export default MyApp;
   ```

3. Open your environment variables file (in our NextJs example is the `.env.local` located on the root folder of the project), and add three new variables: `NEXT_PUBLIC_FRONT_URL`, `NEXT_PUBLIC_DISCORD_CLIENT_ID`, `NEXT_PUBLIC_DISCORD_CLIENT_SECRET`

## Usage: Example of implementation

You could implement this Login with Discord inside the component of your convenience.

```js
import { useDiscord } from "discord-context";

// Your component
const ConnectDiscord = () => {
  const {
    loginWithDiscord, // To redirect the user to the Oauth of Discord
    discordUser, // Discord user object
    clearUserState, // To clear all user information from state
    oauthData, // Auth data object (bearer token, etc)
    loadingDiscordUserData, // True when user data is loading from Discord
    getUserFromDiscord, // Fetch the user from Discord
  } = useDiscord();

  useEffect(
    () =>
      getUserFromDiscord(
        "Bearer",
        "<a Bearer token obtained from oauthData object>"
      ),
    []
  );

  useEffect(() => {
    if (discordUser) {
      console.log(discordUser);
    }
  }, [discordUser]);

  return (
    <button disabled={loadingDiscordUserData} onClick={loginWithDiscord}>
      Login with Discord
    </button>
  );
};

export default ConnectDiscord;
```
