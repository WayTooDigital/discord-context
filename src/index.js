import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import axios from "axios";

let context = createContext();
let { Provider } = context;

export const useDiscord = () => useContext(context);

export const DiscordProvider = ({ redirectUri, discordClientId, discordClientSecret, children }) => {

  const [discordUser, setDiscordUser] = useState(null);
  const [oauthData, setOauthData] = useState(null);
  const [loadingDiscordUserData, setLoadingDiscordUserData] = useState(false);
  const router = useRouter();
  const code = router.query.code;

  const getUserFromDiscord = useCallback(async (token_type, access_token) => {
    try {
      setLoadingDiscordUserData(true);
      const userResult = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });
      setLoadingDiscordUserData(false);
      setDiscordUser(userResult.data);
      return userResult.data;
    } catch (e) {
      setLoadingDiscordUserData(false);
      throw e;
    }
  }, []);

  const clearUserState = () => {
    setDiscordUser(null);
  };

  const getTokenFromDiscord = useCallback(async () => {
    try {
      const oauthResult = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "identify",
        })
      );

      setOauthData(oauthResult.data);
      return oauthResult.data;
    } catch (e) {
      throw e;
    }
  }, [code]);

  const loginWithDiscord = () => {
    router.push(
      `https://discord.com/api/oauth2/authorize?${new URLSearchParams({
        client_id: discordClientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify email guilds.join",
      }).toString()}`
    );
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const oauthData = await getTokenFromDiscord();
        await getUserFromDiscord(oauthData.token_type, oauthData.access_token);
      } catch (err) {}
    };

    if (code) getData();
  }, [code, router, getTokenFromDiscord, getUserFromDiscord]);

  return (
    <Provider
      value={{
        loginWithDiscord,
        discordUser,
        clearUserState,
        oauthData,
        loadingDiscordUserData,
        getUserFromDiscord,
      }}
    >
      {children}
    </Provider>
  );
}
