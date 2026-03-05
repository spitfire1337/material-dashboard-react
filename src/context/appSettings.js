import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSocket } from "context/socket";

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const socket = useSocket();
  const [appSettings, setAppSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAppSettings = () => {
    if (socket) {
      socket.emit("getAppSettings", {}, (res) => {
        if (res.res === 200) {
          const settingsMap = {};
          res.data.forEach((item) => {
            if (item.setting && item.setting.key) {
              settingsMap[item.setting.key] = item.value;
            }
          });
          setAppSettings(settingsMap);
        }
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (socket) {
      fetchAppSettings();
      socket.on("appSettingsUpdated", fetchAppSettings);
      return () => {
        socket.off("appSettingsUpdated", fetchAppSettings);
      };
    }
  }, [socket]);

  return (
    <AppSettingsContext.Provider value={{ appSettings, loading, fetchAppSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

AppSettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAppSettings = () => useContext(AppSettingsContext);
