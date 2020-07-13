import React from 'react';
import { AppLoading } from 'expo';
import AsyncStorage from '@react-native-community/async-storage';
import { User } from '../interfaces';

export interface Site {
  wsUri: string;
  name: string;
  jwt?: string;
  user?: User;
}

interface SiteContextValue {
  sites: Site[];
  activeSite: Site | undefined;
  setActiveSite(site: Site): void;
  addSite(site: Site): void;
  removeSite(wsUri: string): void;
}

export const SitesContext = React.createContext<SiteContextValue>({
  sites: [],
  activeSite: undefined,
  setActiveSite: () => {},
  addSite: () => {},
  removeSite: () => {},
});

export const SitesProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [sites, setSites] = React.useState<Site[]>([]);
  const [activeSite, setActiveSite] = React.useState<Site | undefined>();

  const setDefaultSite = async () => {
    const savedSites = await AsyncStorage.getItem('sites');
    if (savedSites) {
      const parsedSites = JSON.parse(savedSites);
      setActiveSite(parsedSites[0]);
    }
  };

  const loadActiveSite = async () => {
    const savedActiveSite = await AsyncStorage.getItem('activeSite');
    if (savedActiveSite) {
      const parsedActiveSite = JSON.parse(savedActiveSite);
      setActiveSite(parsedActiveSite);
    } else {
      setDefaultSite();
    }
  };

  const loadSites = async () => {
    const savedSites = await AsyncStorage.getItem('sites');
    if (savedSites) {
      const parsedSites = JSON.parse(savedSites);
      setSites(parsedSites);
    } else {
      setSites([]);
    }
  };

  React.useEffect(() => {
    loadActiveSite();
    loadSites();
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (activeSite) {
      AsyncStorage.setItem('activeSite', JSON.stringify(activeSite));
    } else {
      setDefaultSite();
    }
  }, [activeSite]);

  React.useEffect(() => {
    AsyncStorage.setItem('sites', JSON.stringify(sites));
  }, [sites]);

  const addSite = (site: Site) => {
    setSites([...sites, site]);
  };

  const removeSite = (wsUri: string) => {
    setSites(sites.filter((site) => site.wsUri !== wsUri));
  };

  return (
    <SitesContext.Provider
      value={{ sites, activeSite, setActiveSite, addSite, removeSite }}
    >
      {loading ? <AppLoading /> : children}
    </SitesContext.Provider>
  );
};