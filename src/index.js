import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

let context = createContext();
let { Provider } = context;

export const useDiscord = () => useContext(context);

export const DiscordProvider = ({ redirectUri, discordClientId, discordClientSecret, children }) => {

  const [discordUser, setDiscordUser] = useState(null);
  const [oauthData, setOauthData] = useState(null);
  const [loadingDiscordUserData, setLoadingDiscordUserData] = useState(false);
  const [code, setCode] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const c = searchParams.get('code');
    if (c !== null && c !== "") setCode(c);
  }, []);

  const getUserFromDiscord = useCallback(async (token_type, access_token) => {
    try {
      setLoadingDiscordUserData(true);
      const response = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });
      if (response.status === 200) {
        const userResult = await response.json();
        setLoadingDiscordUserData(false);
        setDiscordUser(userResult);
        return userResult;
      }
    } catch (e) {
      setLoadingDiscordUserData(false);
      throw e;
    }
  }, []);

  const clearUserState = useCallback(() => {
    setDiscordUser(null);
  });

  const getTokenFromDiscord = useCallback(async () => {
    try {
      const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "identify",
        })
      }).then(response => response.json());

      setOauthData(oauthResult);
      return oauthResult;
    } catch (e) {
      throw e;
    }
  }, [code]);

  const refreshTokenFromDiscord = useCallback(async (refresh_token) => {
    try {
      const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          grant_type: "refresh_token",
          refresh_token: refresh_token,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(response => response.json());

      setOauthData(oauthResult);

      return oauthResult;
    } catch (err) {
      throw err;
    }
  }, []);

  const loginWithDiscord = () => {
    window.location.replace(
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
  }, [code, getTokenFromDiscord, getUserFromDiscord]);

  return (
    <Provider
      value={{
        loginWithDiscord,
        discordUser,
        clearUserState,
        oauthData,
        loadingDiscordUserData,
        getUserFromDiscord,
        refreshTokenFromDiscord,
      }}
    >
      {children}
    </Provider>
  );
}
