import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    brandName: 'VMD Sports',
    tagline: "Behind Every Great Match, There's a Story.",
    youtubeChannel: 'https://www.youtube.com/@vmdsportslive',
    instagram: 'https://www.instagram.com/vmdsportlive?utm_source=ig_web_button_share_sheet&psln=ZDNlZDc0MzIxNw==',
    facebook: '',
    contactEmail: 'vdhavade50@gmail.com',
    footerAbout: 'VMD Sports – Premium cricket media and merchandise brand.',
    address: '',
    generalPhone: '+91 98194 83036',
    purchaseWhatsApp: '919819483036',
    livestreamWhatsApp: '919819483036',
    bookingWhatsApp: '919819483036',
  });
  const [loaded, setLoaded] = useState(false);

  const refreshSettings = () => {
    return settingsAPI.getPublic()
      .then(res => {
        if (res.data?.settings) setSettings(res.data.settings);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

